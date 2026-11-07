import apiClient from "../../lib/apiClient"
import { isDeletedOrLegacyItem } from "../../utils/catalogFilter"

function filterInventoryRows(responseData) {
  if (!responseData) return responseData
  const data = responseData.data || responseData

  if (Array.isArray(data?.items)) {
    const filtered = data.items.filter(
      (row) => !isDeletedOrLegacyItem(row.item || row)
    )
    return {
      ...responseData,
      data: {
        ...data,
        items: filtered,
        pagination: data.pagination
          ? {
              ...data.pagination,
              totalItems: filtered.length,
              totalPages: Math.max(1, Math.ceil(filtered.length / (data.pagination.limit || 20))),
            }
          : undefined,
      },
    }
  }

  if (Array.isArray(data)) {
    return {
      ...responseData,
      data: data.filter((row) => !isDeletedOrLegacyItem(row.item || row)),
    }
  }

  return responseData
}

export async function getInventoryOverview(params = {}) {
  const response = await apiClient.get("/inventory/overview", { params })
  return filterInventoryRows(response.data)
}

export async function getInventoryBatches(params = {}) {
  const response = await apiClient.get("/inventory/batches", { params })
  return filterInventoryRows(response.data)
}

export async function getInventorySerials(params = {}) {
  const response = await apiClient.get("/inventory/serials", { params })
  return filterInventoryRows(response.data)
}

export async function getInventoryMovements(params = {}) {
  const response = await apiClient.get("/inventory/movements", { params })
  return filterInventoryRows(response.data)
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
  return filterInventoryRows(response.data)
}

export async function updateInventorySerialBatch(serialId, payload) {
  const response = await apiClient.patch(`/inventory/serials/${serialId}/batch`, payload)
  return response.data
}
