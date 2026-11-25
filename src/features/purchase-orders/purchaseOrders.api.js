import apiClient from "../../lib/apiClient"
import { getPendingOfflinePurchaseOrders } from "../../lib/offlineDb"
import { processPurchaseOrderOffline } from "../offline/offlineSync.service"

export async function getPurchaseOrders(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineList = await getPendingOfflinePurchaseOrders().catch(() => [])
    const simulated = offlineList.map((p) => p.simulatedPo).filter(Boolean)
    return { success: true, data: simulated, isOffline: true }
  }
  try {
    const response = await apiClient.get("/purchase-orders", { params })
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineList = await getPendingOfflinePurchaseOrders().catch(() => [])
      const simulated = offlineList.map((p) => p.simulatedPo).filter(Boolean)
      return { success: true, data: simulated, isOffline: true }
    }
    throw err
  }
}

export async function getPurchaseOrderById(id) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineList = await getPendingOfflinePurchaseOrders().catch(() => [])
    const found = offlineList.find((p) => p.clientPoId === id || p.simulatedPo?.id === id)
    return { success: true, data: found?.simulatedPo || null, isOffline: true }
  }
  try {
    const response = await apiClient.get(`/purchase-orders/${id}`)
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineList = await getPendingOfflinePurchaseOrders().catch(() => [])
      const found = offlineList.find((p) => p.clientPoId === id || p.simulatedPo?.id === id)
      return { success: true, data: found?.simulatedPo || null, isOffline: true }
    }
    throw err
  }
}

export async function createPurchaseOrder(payload) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlinePo = await processPurchaseOrderOffline(payload)
    return { success: true, data: offlinePo, isOffline: true }
  }
  try {
    const response = await apiClient.post("/purchase-orders", payload)
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlinePo = await processPurchaseOrderOffline(payload)
      return { success: true, data: offlinePo, isOffline: true }
    }
    throw err
  }
}

export async function updatePurchaseOrder(id, payload) {
  const response = await apiClient.patch(`/purchase-orders/${id}`, payload)
  return response.data
}

export async function updatePurchaseOrderStatus(id, payload) {
  const response = await apiClient.patch(`/purchase-orders/${id}/status`, payload)
  return response.data
}

export async function getPreSaleBatches(params = {}) {
  const response = await apiClient.get("/purchase-orders/pre-sales", { params })
  return response.data
}

