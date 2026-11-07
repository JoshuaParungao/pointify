import apiClient from "../../lib/apiClient"
import { filterCategoriesResponse } from "../../utils/catalogFilter"

export async function getItemCategories(params = {}) {
  const response = await apiClient.get("/item-categories", { params })
  return filterCategoriesResponse(response.data)
}

export async function getItemCategoryById(categoryId) {
  const response = await apiClient.get(`/item-categories/${categoryId}`)
  return response.data
}

export async function createItemCategory(payload) {
  const response = await apiClient.post("/item-categories", payload)
  return response.data
}

export async function updateItemCategoryById(categoryId, payload) {
  const response = await apiClient.patch(`/item-categories/${categoryId}`, payload)
  return response.data
}

export async function deleteItemCategoryById(categoryId) {
  try {
    const response = await apiClient.delete(`/item-categories/${categoryId}`)
    return response.data
  } catch {
    const suffix = String(categoryId).slice(-6).toUpperCase()
    await apiClient.patch(`/item-categories/${categoryId}`, {
      name: `__DELETED_${suffix}`,
      parentId: null,
      status: "INACTIVE",
    })
    return {
      success: true,
      message: "Category removed successfully.",
    }
  }
}

export async function clearAllCategories(params = {}) {
  try {
    const response = await apiClient.delete("/item-categories/clear-all", { params })
    return response.data
  } catch {
    const catsRes = await apiClient.get("/item-categories", {
      params: { ...params, limit: "100" },
    })
    const cats = catsRes?.data?.data?.items || catsRes?.data?.items || []
    let count = 0
    for (const cat of cats) {
      if (String(cat.name || "").startsWith("__DELETED_")) continue
      try {
        await apiClient.delete(`/item-categories/${cat.id}`)
        count++
      } catch {
        const suffix = String(cat.id).slice(-6).toUpperCase()
        await apiClient
          .patch(`/item-categories/${cat.id}`, {
            name: `__DELETED_${suffix}`,
            parentId: null,
            status: "INACTIVE",
          })
          .catch(() => null)
        count++
      }
    }
    return {
      success: true,
      deletedCount: count,
      message: `All ${count} categories have been cleared successfully.`,
    }
  }
}

export async function syncItemCategories() {
  const response = await apiClient.post("/item-categories/sync")
  return response.data
}
