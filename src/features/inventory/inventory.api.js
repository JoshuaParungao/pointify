import apiClient from "../../lib/apiClient"
import { cacheSerials, getCachedSerials } from "../../lib/offlineDb"

export async function getInventoryOverview(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: true, data: { items: [], metrics: {} }, isOffline: true }
  }
  try {
    const response = await apiClient.get("/inventory/overview", { params })
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      return { success: true, data: { items: [], metrics: {} }, isOffline: true }
    }
    throw err
  }
}

export async function getInventoryBatches(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: true, data: [], isOffline: true }
  }
  try {
    const response = await apiClient.get("/inventory/batches", { params })
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      return { success: true, data: [], isOffline: true }
    }
    throw err
  }
}

export async function getInventorySerials(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const cached = await getCachedSerials(params.search || params.serialNumber || "").catch(() => [])
    return { success: true, data: cached, isOffline: true }
  }
  try {
    const response = await apiClient.get("/inventory/serials", { params })
    const list = response.data?.data || response.data
    if (Array.isArray(list)) {
      cacheSerials(list).catch(() => {})
    }
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const cached = await getCachedSerials(params.search || params.serialNumber || "").catch(() => [])
      return { success: true, data: cached, isOffline: true }
    }
    throw err
  }
}



export async function getInventoryMovements(params = {}) {
const response = await apiClient.get("/inventory/movements", { params })
return response.data
}
export async function createStockAdjustment(payload) {
const response = await apiClient.post("/inventory/adjustments", payload)
return response.data
}

export async function createStockIn(payload) {
const response = await apiClient.post("/inventory/stock-in", payload)
return response.data
}

export async function createStockTransferRequest(payload) {
const response = await apiClient.post("/stock-transfers/requests", payload)
return response.data
}

export async function getRequestableStock(params = {}) {
const response = await apiClient.get("/stock-transfers/requestable-items", { params })
return response.data
}

export async function updateInventorySerialBatch(serialId, payload) {
  const response = await apiClient.patch(`/inventory/serials/${serialId}/batch`, payload)
  return response.data
}

export async function updateInventoryBatchCode(batchId, payload) {
  const response = await apiClient.patch(`/inventory/batches/${batchId}`, payload)
  return response.data
}

export async function createInventoryBatch(payload) {
  const response = await apiClient.post("/inventory/batches", payload)
  return response.data
}

