import apiClient from "../../lib/apiClient"
import { getPendingOfflineReceivings } from "../../lib/offlineDb"
import { processReceivingOffline } from "../offline/offlineSync.service"

export async function getPurchaseReceivings(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineList = await getPendingOfflineReceivings().catch(() => [])
    const simulated = offlineList.map((r) => r.simulatedReceiving).filter(Boolean)
    return { success: true, data: simulated, isOffline: true }
  }
  try {
    const response = await apiClient.get("/purchase-receivings", { params })
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineList = await getPendingOfflineReceivings().catch(() => [])
      const simulated = offlineList.map((r) => r.simulatedReceiving).filter(Boolean)
      return { success: true, data: simulated, isOffline: true }
    }
    throw err
  }
}

export async function getPurchaseReceivingById(id) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineList = await getPendingOfflineReceivings().catch(() => [])
    const found = offlineList.find((r) => r.clientReceivingId === id || r.simulatedReceiving?.id === id)
    return { success: true, data: found?.simulatedReceiving || null, isOffline: true }
  }
  try {
    const response = await apiClient.get(`/purchase-receivings/${id}`)
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineList = await getPendingOfflineReceivings().catch(() => [])
      const found = offlineList.find((r) => r.clientReceivingId === id || r.simulatedReceiving?.id === id)
      return { success: true, data: found?.simulatedReceiving || null, isOffline: true }
    }
    throw err
  }
}

export async function createPurchaseReceiving(payload) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineRec = await processReceivingOffline(payload)
    return { success: true, data: offlineRec, isOffline: true }
  }
  try {
    const response = await apiClient.post("/purchase-receivings", payload)
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineRec = await processReceivingOffline(payload)
      return { success: true, data: offlineRec, isOffline: true }
    }
    throw err
  }
}

export async function updatePurchaseReceiving(id, payload) {
  const response = await apiClient.patch(`/purchase-receivings/${id}`, payload)
  return response.data
}

export async function updatePurchaseReceivingStatus(id, payload) {
  const response = await apiClient.patch(`/purchase-receivings/${id}/status`, payload)
  return response.data
}

