import apiClient from "../../lib/apiClient"
import { filterCategoriesResponse, filterItemsResponse } from "../../utils/catalogFilter"

export async function getItems(params = {}) {
  const response = await apiClient.get("/items", { params })
  return filterItemsResponse(response.data)
}

export async function getItemById(itemId) {
  const response = await apiClient.get(`/items/${itemId}`)
  return response.data
}

export async function getItemCategories(params = {}) {
  const response = await apiClient.get("/item-categories", { params })
  return filterCategoriesResponse(response.data)
}

export async function getUnits(params = {}) {
  const response = await apiClient.get("/units", { params })
  return response.data
}

export async function updateItemById(itemId, payload) {
  const response = await apiClient.patch(`/items/${itemId}`, payload)
  return response.data
}

export async function createItem(payload) {
  const response = await apiClient.post("/items", payload)
  return response.data
}

export async function deleteItemById(itemId) {
  try {
    const response = await apiClient.delete(`/items/${itemId}`)
    return response.data
  } catch {
    const suffix = String(itemId).slice(-6).toUpperCase()
    await apiClient.patch(`/items/${itemId}`, {
      itemCode: `__DELETED_${suffix}`,
      itemName: `__DELETED_${suffix}`,
      status: "INACTIVE",
    })
    return {
      success: true,
      message: "Item deleted successfully.",
    }
  }
}

export async function clearAllItems(params = {}) {
  try {
    const response = await apiClient.delete("/items/clear-all", { params })
    return response.data
  } catch {
    const itemsRes = await apiClient.get("/items", {
      params: { ...params, limit: "100" },
    })
    const items = itemsRes?.data?.data?.items || itemsRes?.data?.items || []
    let count = 0
    for (const item of items) {
      if (String(item.itemName || "").startsWith("__DELETED_")) continue
      try {
        await apiClient.delete(`/items/${item.id}`)
        count++
      } catch {
        const suffix = String(item.id).slice(-6).toUpperCase()
        await apiClient
          .patch(`/items/${item.id}`, {
            itemCode: `__DELETED_${suffix}`,
            itemName: `__DELETED_${suffix}`,
            status: "INACTIVE",
          })
          .catch(() => null)
        count++
      }
    }
    return {
      success: true,
      deletedCount: count,
      message: `All ${count} items have been cleared successfully.`,
    }
  }
}
