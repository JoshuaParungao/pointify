import apiClient from "../../lib/apiClient"
import { processCustomerOffline } from "../offline/offlineSync.service"
import { getCachedCustomers } from "../../lib/offlineDb"

export async function getCustomers(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const cached = await getCachedCustomers().catch(() => [])
    return { success: true, data: cached, isOffline: true }
  }
  try {
    const response = await apiClient.get("/customers", { params })
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const cached = await getCachedCustomers().catch(() => [])
      return { success: true, data: cached, isOffline: true }
    }
    throw err
  }
}

export async function getCustomerById(id) {
  const response = await apiClient.get(`/customers/${id}`)
  return response.data
}

export async function getCustomerHistory(id, params = {}) {
  const response = await apiClient.get(`/customers/${id}/history`, { params })
  return response.data
}

export async function createCustomer(payload) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineCust = await processCustomerOffline(payload)
    return { success: true, data: offlineCust, isOffline: true }
  }
  try {
    const response = await apiClient.post("/customers", payload)
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineCust = await processCustomerOffline(payload)
      return { success: true, data: offlineCust, isOffline: true }
    }
    throw err
  }
}

export async function updateCustomerById(id, payload) {
  const response = await apiClient.patch(`/customers/${id}`, payload)
  return response.data
}

export async function getAccountsReceivable(params = {}) {
  const response = await apiClient.get("/customers/accounts-receivable", { params })
  return response.data
}
