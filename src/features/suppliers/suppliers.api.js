import apiClient from "../../lib/apiClient"
import { getCachedSuppliers, putCachedSupplier } from "../../lib/offlineDb"
import { processSupplierOffline } from "../offline/offlineSync.service"

export async function getSuppliers(params = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const cached = await getCachedSuppliers().catch(() => [])
    return { success: true, data: cached, isOffline: true }
  }
  try {
    const response = await apiClient.get("/suppliers", { params })
    const list = response.data?.data || response.data
    if (Array.isArray(list)) {
      list.forEach((s) => {
        if (s && s.id) putCachedSupplier(s).catch(() => {})
      })
    }
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const cached = await getCachedSuppliers().catch(() => [])
      return { success: true, data: cached, isOffline: true }
    }
    throw err
  }
}

export async function getSupplierById(id) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const cached = await getCachedSuppliers().catch(() => [])
    const found = cached.find((s) => s.id === id)
    return { success: true, data: found || null, isOffline: true }
  }
  try {
    const response = await apiClient.get(`/suppliers/${id}`)
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const cached = await getCachedSuppliers().catch(() => [])
      const found = cached.find((s) => s.id === id)
      return { success: true, data: found || null, isOffline: true }
    }
    throw err
  }
}

export async function getSupplierHistory(id, params = {}) {
  const response = await apiClient.get(`/suppliers/${id}/history`, { params })
  return response.data
}

export async function createSupplier(payload) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const offlineSup = await processSupplierOffline(payload)
    return { success: true, data: offlineSup, isOffline: true }
  }
  try {
    const response = await apiClient.post("/suppliers", payload)
    const sup = response.data?.data || response.data
    if (sup && sup.id) {
      putCachedSupplier(sup).catch(() => {})
    }
    return response.data
  } catch (err) {
    if (typeof navigator !== "undefined" && (!navigator.onLine || !err.response || err.code === "ERR_NETWORK")) {
      const offlineSup = await processSupplierOffline(payload)
      return { success: true, data: offlineSup, isOffline: true }
    }
    throw err
  }
}

export async function updateSupplier(id, payload) {
  const response = await apiClient.patch(`/suppliers/${id}`, payload)
  return response.data
}

export async function updateSupplierStatus(id, status) {
  const response = await apiClient.patch(`/suppliers/${id}/status`, { status })
  return response.data
}

export async function getAccountsPayable(params = {}) {
  const response = await apiClient.get("/suppliers/accounts-payable", { params })
  return response.data
}

export async function recordSupplierPayment(receivingId, payload) {
  const response = await apiClient.post(`/suppliers/accounts-payable/${receivingId}/payments`, payload)
  return response.data
}

