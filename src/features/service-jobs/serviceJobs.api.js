import apiClient from "../../lib/apiClient"

export async function getServiceJobs(params = {}) {
  const response = await apiClient.get("/service-jobs", { params })
  return response.data
}

export async function getServiceTechnicians(params = {}) {
  const response = await apiClient.get("/service-jobs/technicians", { params })
  return response.data
}

export async function getServiceJobById(id) {
  const response = await apiClient.get(`/service-jobs/${id}`)
  return response.data
}

export async function createServiceJob(payload) {
  const response = await apiClient.post("/service-jobs", payload)
  return response.data
}

export async function updateServiceJobStatus(id, payload) {
  const response = await apiClient.patch(`/service-jobs/${id}/status`, payload)
  return response.data
}

export async function updateServiceJobAssignment(id, payload) {
  const response = await apiClient.patch(`/service-jobs/${id}/assignment`, payload)
  return response.data
}

export async function releaseServiceJob(id, payload) {
  const response = await apiClient.post(`/service-jobs/${id}/release`, payload)
  return response.data
}

export async function createServicePayment(id, payload) {
  const response = await apiClient.post(`/service-jobs/${id}/payment`, payload)
  return response.data
}

export async function cancelServicePayment(paymentId, payload) {
  const response = await apiClient.post(
    `/service-jobs/payments/${paymentId}/cancel`,
    payload,
  )
  return response.data
}

const LEGACY_SERVICE_CATALOG_IDS = new Set([
  "sc-clean-laptop",
  "sc-clean-desktop",
  "sc-format-os",
  "sc-screen-laptop",
  "sc-gpu-repaste",
  "sc-board-power",
  "sc-macbook-liquid",
  "sc-printer-clean",
  "sc-monitor-board",
  "sc-smartphone-lcd",
  "sc-console-clean",
  "sc-pccomponent-diagnosis",
  "sc-pms-general",
  "sc-setup-config",
  "sc-part-install",
  "sc-advanced-overhaul",
  "sc-bench-diagnosis",
])

const LEGACY_SERVICE_PART_IDS = new Set([
  "sp-lcd-156-slim-30p",
  "sp-lcd-140-slim-30p",
  "sp-thermal-paste-paste",
  "sp-thermal-pad-kit",
  "sp-laptop-battery-std",
  "sp-laptop-keyboard-std",
  "sp-power-ic-chip",
  "sp-dc-jack-port",
  "sp-std-module",
  "sp-maint-consumable",
  "sp-power-unit",
  "sp-precision-part",
])

export async function getServiceCatalog() {
  const response = await apiClient.get("/service-jobs/catalog")
  const raw = response.data
  if (raw && Array.isArray(raw.data)) {
    return {
      ...raw,
      data: raw.data.filter((item) => item && !LEGACY_SERVICE_CATALOG_IDS.has(item.id)),
    }
  }
  return raw
}

export async function createServiceCatalogItem(payload) {
  const response = await apiClient.post("/service-jobs/catalog", payload)
  return response.data
}

export async function updateServiceCatalogItem(id, payload) {
  const response = await apiClient.put(`/service-jobs/catalog/${id}`, payload)
  return response.data
}

export async function deleteServiceCatalogItem(id) {
  const response = await apiClient.delete(`/service-jobs/catalog/${id}`)
  return response.data
}

export async function getServicePartsCatalog() {
  const response = await apiClient.get("/service-jobs/parts-catalog")
  const raw = response.data
  if (raw && Array.isArray(raw.data)) {
    return {
      ...raw,
      data: raw.data.filter((item) => item && !LEGACY_SERVICE_PART_IDS.has(item.id)),
    }
  }
  return raw
}

export async function createServicePartsCatalogItem(payload) {
  const response = await apiClient.post("/service-jobs/parts-catalog", payload)
  return response.data
}

export async function updateServicePartsCatalogItem(id, payload) {
  const response = await apiClient.put(`/service-jobs/parts-catalog/${id}`, payload)
  return response.data
}

export async function deleteServicePartsCatalogItem(id) {
  const response = await apiClient.delete(`/service-jobs/parts-catalog/${id}`)
  return response.data
}
