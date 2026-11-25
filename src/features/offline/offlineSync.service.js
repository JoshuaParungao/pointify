// Offline Sync Service for POSynctify POS
// Coordinates client-side caching, offline document generation, and background synchronization
// Modules: Sales, Customers, Quotations, Service Jobs, Suppliers, Purchase Orders, and Receivings

import apiClient from "../../lib/apiClient"
import {
  enqueueOfflineSale,
  getPendingOfflineSales,
  updateOfflineSale,
  enqueueOfflineCustomer,
  getPendingOfflineCustomers,
  updateOfflineCustomer,
  putCachedCustomer,
  enqueueOfflineQuotation,
  getPendingOfflineQuotations,
  updateOfflineQuotation,
  enqueueOfflineJobOrder,
  getPendingOfflineJobOrders,
  updateOfflineJobOrder,
  enqueueOfflineSupplier,
  getPendingOfflineSuppliers,
  updateOfflineSupplier,
  putCachedSupplier,
  enqueueOfflinePurchaseOrder,
  getPendingOfflinePurchaseOrders,
  updateOfflinePurchaseOrder,
  enqueueOfflineReceiving,
  getPendingOfflineReceivings,
  updateOfflineReceiving,
  getOfflineQueueCount,
} from "../../lib/offlineDb"

// Generate random client IDs
export function generateClientSaleId() {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `OFF-${timestamp}-${randomPart}`
}

export function generateOfflineReceiptCode(branchCode = "MAIN") {
  const now = new Date()
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "")
  const randomDigits = Math.floor(100 + Math.random() * 900)
  return `OFF-${branchCode.toUpperCase()}-${dateStr}-${timeStr}-${randomDigits}`
}

export function generateOfflineQuoteCode(branchCode = "MAIN") {
  const now = new Date()
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
  const randomDigits = Math.floor(100 + Math.random() * 900)
  return `QT-OFF-${branchCode.toUpperCase()}-${dateStr}-${randomDigits}`
}

export function generateOfflineJobCode(branchCode = "MAIN") {
  const now = new Date()
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
  const randomDigits = Math.floor(100 + Math.random() * 900)
  return `JO-OFF-${branchCode.toUpperCase()}-${dateStr}-${randomDigits}`
}

export function generateOfflinePoCode(branchCode = "MAIN") {
  const now = new Date()
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
  const randomDigits = Math.floor(100 + Math.random() * 900)
  return `PO-OFF-${branchCode.toUpperCase()}-${dateStr}-${randomDigits}`
}

export function generateOfflineReceivingCode(branchCode = "MAIN") {
  const now = new Date()
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "")
  const randomDigits = Math.floor(100 + Math.random() * 900)
  return `REC-OFF-${branchCode.toUpperCase()}-${dateStr}-${randomDigits}`
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

// =========================================================
// 1. OFFLINE SALE PROCESSING
// =========================================================

export async function processSaleOffline(salePayload, extra = {}) {
  const clientSaleId = generateClientSaleId()
  const branchCode = extra.branchCode || "MAIN"
  const receiptCode = generateOfflineReceiptCode(branchCode)
  const createdAt = new Date().toISOString()

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
      customerName: salePayload.customerName || (extra.customer && extra.customer.fullName) || null,
      customerAddress: salePayload.customerAddress || (extra.customer && extra.customer.address) || null,
      customerPhone: salePayload.customerPhone || (extra.customer && extra.customer.mobileNumber) || null,
      customer: extra.customer || {
        fullName: salePayload.customerName || "Walk-in Customer",
        address: salePayload.customerAddress || null,
        mobileNumber: salePayload.customerPhone || null,
      },
      cashier: extra.cashier || null,
      branch: extra.branch || null,
      items: (salePayload.items || []).map((it, idx) => ({
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

// =========================================================
// 2. OFFLINE CUSTOMER PROCESSING
// =========================================================

export async function processCustomerOffline(customerPayload) {
  const clientCustomerId = `CUST-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const createdAt = new Date().toISOString()

  const simulatedCustomer = {
    ...customerPayload,
    id: clientCustomerId,
    isOffline: true,
    createdAt,
    status: "ACTIVE",
  }

  await putCachedCustomer(simulatedCustomer)

  await enqueueOfflineCustomer({
    clientCustomerId,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: customerPayload,
    simulatedCustomer,
  })

  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientCustomerId })

  return simulatedCustomer
}

// =========================================================
// 3. OFFLINE QUOTATION PROCESSING
// =========================================================

export async function processQuotationOffline(quotePayload, extra = {}) {
  const clientQuotationId = `QUOTE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const branchCode = extra.branchCode || "MAIN"
  const quotationCode = generateOfflineQuoteCode(branchCode)
  const createdAt = new Date().toISOString()

  const simulatedQuote = {
    ...quotePayload,
    id: clientQuotationId,
    quotationCode,
    isOffline: true,
    createdAt,
    status: "DRAFT",
    customer: extra.customer || null,
    items: (quotePayload.items || []).map((it, idx) => ({
      ...it,
      id: `offline-quote-item-${idx}`,
    })),
  }

  await enqueueOfflineQuotation({
    clientQuotationId,
    quotationCode,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: quotePayload,
    simulatedQuote,
  })

  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientQuotationId })

  return simulatedQuote
}

// =========================================================
// 4. OFFLINE JOB ORDER PROCESSING
// =========================================================

export async function processJobOrderOffline(jobPayload, extra = {}) {
  const clientJobOrderId = `JO-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const branchCode = extra.branchCode || "MAIN"
  const jobCode = generateOfflineJobCode(branchCode)
  const createdAt = new Date().toISOString()

  const simulatedJob = {
    ...jobPayload,
    id: clientJobOrderId,
    jobCode,
    isOffline: true,
    createdAt,
    status: "IN_PROGRESS",
    customer: extra.customer || null,
    branch: extra.branch || null,
  }

  await enqueueOfflineJobOrder({
    clientJobOrderId,
    jobCode,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: jobPayload,
    simulatedJob,
  })

  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientJobOrderId })

  return simulatedJob
}

// =========================================================
// 5. OFFLINE SUPPLIER PROCESSING
// =========================================================

export async function processSupplierOffline(supplierPayload) {
  const clientSupplierId = `SUP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const createdAt = new Date().toISOString()

  const simulatedSupplier = {
    ...supplierPayload,
    id: clientSupplierId,
    isOffline: true,
    createdAt,
    status: "ACTIVE",
  }

  await putCachedSupplier(simulatedSupplier)

  await enqueueOfflineSupplier({
    clientSupplierId,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: supplierPayload,
    simulatedSupplier,
  })

  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientSupplierId })

  return simulatedSupplier
}

// =========================================================
// 6. OFFLINE PURCHASE ORDER PROCESSING
// =========================================================

export async function processPurchaseOrderOffline(poPayload, extra = {}) {
  const clientPoId = `PO-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const branchCode = extra.branchCode || "MAIN"
  const poCode = generateOfflinePoCode(branchCode)
  const createdAt = new Date().toISOString()

  const simulatedPo = {
    ...poPayload,
    id: clientPoId,
    poCode,
    isOffline: true,
    createdAt,
    status: "PENDING",
    supplier: extra.supplier || null,
    branch: extra.branch || null,
    items: (poPayload.items || []).map((it, idx) => ({
      ...it,
      id: `offline-po-item-${idx}`,
    })),
  }

  await enqueueOfflinePurchaseOrder({
    clientPoId,
    poCode,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: poPayload,
    simulatedPo,
  })

  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientPoId })

  return simulatedPo
}

// =========================================================
// 7. OFFLINE PURCHASE RECEIVING PROCESSING
// =========================================================

export async function processReceivingOffline(receivingPayload, extra = {}) {
  const clientReceivingId = `REC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const branchCode = extra.branchCode || "MAIN"
  const receivingCode = generateOfflineReceivingCode(branchCode)
  const createdAt = new Date().toISOString()

  const simulatedReceiving = {
    ...receivingPayload,
    id: clientReceivingId,
    receivingCode,
    isOffline: true,
    createdAt,
    status: "COMPLETED",
    supplier: extra.supplier || null,
    branch: extra.branch || null,
    items: (receivingPayload.items || []).map((it, idx) => ({
      ...it,
      id: `offline-rec-item-${idx}`,
    })),
  }

  await enqueueOfflineReceiving({
    clientReceivingId,
    receivingCode,
    status: "PENDING",
    syncAttempts: 0,
    createdAt,
    payload: receivingPayload,
    simulatedReceiving,
  })

  const count = await getOfflineQueueCount()
  notifySubscribers({ type: "ENQUEUED", count, clientReceivingId })

  return simulatedReceiving
}

// =========================================================
// GLOBAL BACKGROUND SYNC ENGINE
// =========================================================

export async function syncOfflineSales() {
  return syncAllOfflineRecords()
}

export async function syncAllOfflineRecords() {
  if (isSyncing || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return { synced: 0, pending: await getOfflineQueueCount() }
  }

  isSyncing = true
  notifySubscribers({ type: "SYNC_START" })

  let syncedCount = 0
  let failedCount = 0

  try {
    // 1. Sync Pending Suppliers First
    const pendingSuppliers = await getPendingOfflineSuppliers()
    for (const record of pendingSuppliers) {
      try {
        await updateOfflineSupplier(record.clientSupplierId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
        const res = await apiClient.post("/suppliers", record.payload)
        const serverSup = res.data?.data || res.data
        await updateOfflineSupplier(record.clientSupplierId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverSupplierId: serverSup?.id,
        })
        if (serverSup?.id) {
          await putCachedSupplier(serverSup)
        }
        syncedCount++
      } catch (err) {
        console.warn(`Supplier sync failed for ${record.clientSupplierId}:`, err)
        failedCount++
        await updateOfflineSupplier(record.clientSupplierId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }

    // 2. Sync Pending Customers
    const pendingCustomers = await getPendingOfflineCustomers()
    for (const record of pendingCustomers) {
      try {
        await updateOfflineCustomer(record.clientCustomerId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
        const res = await apiClient.post("/customers", record.payload)
        const serverCust = res.data?.data || res.data
        await updateOfflineCustomer(record.clientCustomerId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverCustomerId: serverCust?.id,
        })
        if (serverCust?.id) {
          await putCachedCustomer(serverCust)
        }
        syncedCount++
      } catch (err) {
        console.warn(`Customer sync failed for ${record.clientCustomerId}:`, err)
        failedCount++
        await updateOfflineCustomer(record.clientCustomerId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }

    // 3. Sync Pending Purchase Orders
    const pendingPos = await getPendingOfflinePurchaseOrders()
    for (const record of pendingPos) {
      try {
        await updateOfflinePurchaseOrder(record.clientPoId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
        const res = await apiClient.post("/purchase-orders", record.payload)
        const serverPo = res.data?.data || res.data
        await updateOfflinePurchaseOrder(record.clientPoId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverPoId: serverPo?.id,
        })
        syncedCount++
      } catch (err) {
        console.warn(`Purchase Order sync failed for ${record.clientPoId}:`, err)
        failedCount++
        await updateOfflinePurchaseOrder(record.clientPoId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }

    // 4. Sync Pending Receivings
    const pendingReceivings = await getPendingOfflineReceivings()
    for (const record of pendingReceivings) {
      try {
        await updateOfflineReceiving(record.clientReceivingId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
        const res = await apiClient.post("/purchase-receivings", record.payload)
        const serverRec = res.data?.data || res.data
        await updateOfflineReceiving(record.clientReceivingId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverReceivingId: serverRec?.id,
        })
        syncedCount++
      } catch (err) {
        console.warn(`Receiving sync failed for ${record.clientReceivingId}:`, err)
        failedCount++
        await updateOfflineReceiving(record.clientReceivingId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }

    // 5. Sync Pending Sales
    const pendingSales = await getPendingOfflineSales()
    for (const record of pendingSales) {
      try {
        await updateOfflineSale(record.clientSaleId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
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
        console.error(`Sale sync failed for ${record.clientSaleId}:`, err)
        failedCount++
        await updateOfflineSale(record.clientSaleId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }

    // 6. Sync Pending Quotations
    const pendingQuotes = await getPendingOfflineQuotations()
    for (const record of pendingQuotes) {
      try {
        await updateOfflineQuotation(record.clientQuotationId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
        const res = await apiClient.post("/quotations", record.payload)
        const createdQuote = res.data?.data || res.data
        await updateOfflineQuotation(record.clientQuotationId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverQuotationId: createdQuote?.id,
        })
        syncedCount++
      } catch (err) {
        console.warn(`Quotation sync failed for ${record.clientQuotationId}:`, err)
        failedCount++
        await updateOfflineQuotation(record.clientQuotationId, {
          status: "FAILED",
          lastSyncError: err.response?.data?.message || err.message,
        })
      }
    }

    // 7. Sync Pending Service Job Orders
    const pendingJobs = await getPendingOfflineJobOrders()
    for (const record of pendingJobs) {
      try {
        await updateOfflineJobOrder(record.clientJobOrderId, {
          status: "SYNCING",
          syncAttempts: (record.syncAttempts || 0) + 1,
        })
        const res = await apiClient.post("/service-jobs", record.payload)
        const createdJob = res.data?.data || res.data
        await updateOfflineJobOrder(record.clientJobOrderId, {
          status: "SYNCED",
          syncedAt: new Date().toISOString(),
          serverJobOrderId: createdJob?.id,
        })
        syncedCount++
      } catch (err) {
        console.warn(`Job order sync failed for ${record.clientJobOrderId}:`, err)
        failedCount++
        await updateOfflineJobOrder(record.clientJobOrderId, {
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
    console.log("Internet restored. Triggering multi-module offline sync runner...")
    syncAllOfflineRecords().catch((e) => console.warn("Auto-sync error:", e))
  })
}
