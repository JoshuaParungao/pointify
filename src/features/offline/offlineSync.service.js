// Offline Sync Service for POSynctify POS
// Coordinates client-side caching, offline receipt generation, and background synchronization

import apiClient from "../../lib/apiClient"
import {
  enqueueOfflineSale,
  getPendingOfflineSales,
  updateOfflineSale,
  getOfflineQueueCount,
} from "../../lib/offlineDb"

// Generate a random client offline ID
export function generateClientSaleId() {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `OFF-${timestamp}-${randomPart}`
}

// Format an offline receipt code for printing
export function generateOfflineReceiptCode(branchCode = "MAIN") {
  const now = new Date()
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "")
  const randomDigits = Math.floor(100 + Math.random() * 900)
  return `OFF-${branchCode.toUpperCase()}-${dateStr}-${timeStr}-${randomDigits}`
}

let isSyncing = false
const listeners = new Set()

export function subscribeToSyncChanges(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notifySubscribers(eventData) {
  for (const cb of listeners) {
    try {
      cb(eventData)
    } catch (e) {
      console.warn("Sync listener notification error:", e)
    }
  }
}

/**
 * Saves a sale locally in IndexedDB when offline.
 * Returns a simulated completed sale object so the cashier can immediately view and print the receipt.
 */
export async function processSaleOffline(salePayload, extra = {}) {
  const clientSaleId = generateClientSaleId()
  const branchCode = extra.branchCode || "MAIN"
  const receiptCode = generateOfflineReceiptCode(branchCode)
  const createdAt = new Date().toISOString()

  // Construct a realistic completed sale object matching backend structure
  const offlineSaleRecord = {
    clientSaleId,
    receiptCode,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: {
      ...salePayload,
      clientSaleId,
      offlineReceiptCode: receiptCode,
      offlineCreatedAt: createdAt,
    },
    // Mirror completed sale object for instant receipt printing
    simulatedSale: {
      id: clientSaleId,
      receiptCode,
      isOfflineSale: true,
      offlineSyncStatus: "PENDING",
      createdAt,
      saleDate: salePayload.saleDate || createdAt,
      subtotal: salePayload.subtotal || extra.subtotal || 0,
      totalDiscount: salePayload.totalDiscount || extra.totalDiscount || 0,
      serviceCharge: salePayload.serviceCharge || 0,
      grandTotal: extra.grandTotal || salePayload.grandTotal || 0,
      remarks: [
        "[OFFLINE SALE - PENDING SYNC]",
        salePayload.remarks,
      ].filter(Boolean).join(" | "),
      customer: extra.customer || null,
      cashier: extra.cashier || null,
      branch: extra.branch || null,
      saleItems: (salePayload.items || []).map((it, idx) => ({
        id: `offline-item-${idx}`,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountAmount: it.discountAmount || 0,
        lineTotal: it.lineTotal || (Number(it.unitPrice) * Number(it.quantity) - Number(it.discountAmount || 0)),
        description: it.description || it.itemNameSnapshot || "Item",
        item: it.item || null,
        serialNumber: it.serialNumber || null,
        warrantyDuration: it.warrantyDuration || null,
      })),
      salePayments: (salePayload.payments || []).map((p, idx) => ({
        id: `offline-payment-${idx}`,
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        referenceNo: p.referenceNo || `OFF-REF-${idx}`,
        remarks: p.remarks || "Offline Settlement",
      })),
    },
  }

  await enqueueOfflineSale(offlineSaleRecord)
  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientSaleId })

  return offlineSaleRecord.simulatedSale
}

/**
 * Uploads all pending offline sales to the server.
 */
export async function syncOfflineSales() {
  if (isSyncing || typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, pending: await getOfflineQueueCount() }
  }

  isSyncing = true
  notifySubscribers({ type: "SYNC_START" })

  let syncedCount = 0
  let failedCount = 0

  try {
    const pendingSales = await getPendingOfflineSales()
    if (pendingSales.length === 0) {
      isSyncing = false
      notifySubscribers({ type: "SYNC_END", synced: 0, pending: 0 })
      return { synced: 0, pending: 0 }
    }

    for (const record of pendingSales) {
      try {
        await updateOfflineSale(record.clientSaleId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })

        // Send to backend sync endpoint
        const response = await apiClient.post("/sales/sync-offline", record.payload)
        const createdSale = response.data?.data || response.data

        await updateOfflineSale(record.clientSaleId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverSaleId: createdSale?.id,
          serverReceiptCode: createdSale?.receiptCode,
        })

        syncedCount++
      } catch (err) {
        console.error(`Failed to sync offline sale ${record.clientSaleId}:`, err)
        failedCount++
        await updateOfflineSale(record.clientSaleId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }
  } finally {
    isSyncing = false
    const remainingPending = await getOfflineQueueCount()
    notifySubscribers({
      type: "SYNC_END",
      synced: syncedCount,
      failed: failedCount,
      pending: remainingPending,
    })
  }

  return { synced: syncedCount, failed: failedCount }
}

// Auto-sync listener on reconnection
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Internet connection detected. Starting offline sales sync...")
    syncOfflineSales().catch((e) => console.warn("Auto-sync error:", e))
  })
}
