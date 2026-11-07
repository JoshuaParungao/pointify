import apiClient from "../lib/apiClient"

const LEGACY_COMPUTER_CATEGORY_CODES = new Set([
  "CAT-ACCESSORIES",
  "CAT-ACC-CABLE",
  "CAT-ACC-ADAPT",
  "CAT-ACC-HUB",
  "CAT-ACC-CHRG",
  "CAT-ACC-COOL",
  "CAT-ACC-OTH",
  "CAT-CPU",
  "CAT-CPU-DESK",
  "CAT-CPU-LAP",
  "CAT-CPU-SRV",
  "CAT-GPU",
  "CAT-GPU-GAME",
  "CAT-GPU-PRO",
  "CAT-GPU-EXT",
  "CAT-MOBO",
  "CAT-MOBO-DESK",
  "CAT-MOBO-SRV",
  "CAT-MOBO-IND",
  "CAT-PERIPHERALS",
  "CAT-PERI-KB",
  "CAT-PERI-MOUSE",
  "CAT-PERI-MON",
  "CAT-PERI-AUDIO",
  "CAT-PERI-CAM",
  "CAT-PERI-SPK",
  "CAT-PERI-MIC",
  "CAT-PERI-CTRL",
  "CAT-RAM",
  "CAT-RAM-DESK",
  "CAT-RAM-LAP",
  "CAT-RAM-SRV",
  "CAT-STORAGE",
  "CAT-STRG-HDD",
  "CAT-STRG-SATA",
  "CAT-STRG-NVME",
  "CAT-STRG-EXTHDD",
  "CAT-STRG-EXTSSD",
  "CAT-STRG-USB",
  "CAT-PSU",
  "CAT-CASE",
  "CAT-COOLING",
  "CAT-MONITOR",
  "CAT-NETWORKING",
])

const LEGACY_COMPUTER_CATEGORY_NAMES = new Set([
  "cpu / processor",
  "desktop cpu",
  "laptop cpu",
  "server cpu",
  "gpu / graphics card",
  "gaming gpu",
  "professional / workstation gpu",
  "external gpu (egpu)",
  "motherboard",
  "desktop motherboard",
  "server motherboard",
  "industrial / embedded motherboard",
  "peripherals",
  "keyboard",
  "mouse",
  "monitor",
  "headset",
  "webcam",
  "speakers",
  "microphone",
  "controller",
  "ram / memory",
  "desktop ram",
  "laptop ram (so-dimm)",
  "server ram (ecc)",
  "storage",
  "hdd",
  "sata ssd",
  "nvme ssd",
  "external hdd",
  "external ssd",
  "usb flash drive",
  "cables",
  "adapters",
  "hubs",
  "chargers",
  "cooling accessories",
  "other accessories",
  "power supply",
  "pc case / chassis",
  "cooling & fans",
  "monitor / display",
  "networking",
])

const LEGACY_COMPUTER_ITEM_CODES = new Set([
  "ITEM-MAIN-001",
  "ITEM-MAIN-002",
  "ITEM-MAIN-003",
  "ITEM-MAB-001",
  "ITEM-MAB-002",
  "ITEM-MAIN-API",
  "ITEM-MAIN-API-001",
])

const COMPUTER_HARDWARE_REGEX =
  /\b(ryzen|radeon|geforce|rtx\s*\d|gtx\s*\d|motherboard|mainboard|ddr4|ddr5|nvme|sata\s*ssd|micro-atx|mini-itx|socket\s*am[45]|lga\s*\d+|pc\s*case|cpu\s*cooler|liquid\s*cooler|thermal\s*paste|graphics\s*card|video\s*card|processor)\b/i

export function isDeletedOrLegacyCategory(cat) {
  if (!cat) return false
  const code = String(cat.categoryCode || "").trim().toUpperCase()
  const name = String(cat.name || "").trim()
  const nameLower = name.toLowerCase()
  const descLower = String(cat.description || "").trim().toLowerCase()

  if (code.startsWith("__DELETED_") || name.startsWith("__DELETED_")) {
    return true
  }

  if (LEGACY_COMPUTER_CATEGORY_CODES.has(code)) {
    return true
  }

  if (LEGACY_COMPUTER_CATEGORY_NAMES.has(nameLower)) {
    return true
  }

  if (
    nameLower === "accessories" &&
    (descLower.includes("pc accessories") || descLower.includes("computer accessories"))
  ) {
    return true
  }

  if (cat.parent && isDeletedOrLegacyCategory(cat.parent)) {
    return true
  }

  return false
}

export function isDeletedOrLegacyItem(item) {
  if (!item) return false
  const code = String(item.itemCode || "").trim().toUpperCase()
  const name = String(item.itemName || item.name || "").trim()
  const desc = String(item.description || "").trim()
  const model = String(item.modelName || "").trim()

  if (code.startsWith("__DELETED_") || name.startsWith("__DELETED_")) {
    return true
  }

  if (LEGACY_COMPUTER_ITEM_CODES.has(code)) {
    return true
  }

  if (item.category && isDeletedOrLegacyCategory(item.category)) {
    return true
  }

  if (COMPUTER_HARDWARE_REGEX.test(`${name} ${model} ${desc}`)) {
    return true
  }

  return false
}

let hasTriggeredAutoPurge = false

export async function purgeLegacyComputerCatalogInBackground() {
  if (hasTriggeredAutoPurge) return
  hasTriggeredAutoPurge = true

  try {
    const [itemsRes, catsRes] = await Promise.all([
      apiClient.get("/items", { params: { limit: "100" } }).catch(() => null),
      apiClient.get("/item-categories", { params: { limit: "100" } }).catch(() => null),
    ])

    const allItems = itemsRes?.data?.data?.items || itemsRes?.data?.items || []
    const allCats = catsRes?.data?.data?.items || catsRes?.data?.items || []

    const legacyItems = allItems.filter(isDeletedOrLegacyItem)
    for (const item of legacyItems) {
      if (String(item.itemName || "").startsWith("__DELETED_")) continue
      try {
        await apiClient.delete(`/items/${item.id}`)
      } catch {
        const suffix = String(item.id).slice(-6).toUpperCase()
        await apiClient
          .patch(`/items/${item.id}`, {
            itemCode: `__DELETED_${suffix}`,
            itemName: `__DELETED_${suffix}`,
            status: "INACTIVE",
          })
          .catch(() => null)
      }
    }

    const legacyCats = allCats.filter(isDeletedOrLegacyCategory)
    const subCats = legacyCats.filter((c) => Boolean(c.parentId))
    const parentCats = legacyCats.filter((c) => !c.parentId)

    for (const sub of subCats) {
      if (String(sub.name || "").startsWith("__DELETED_")) continue
      try {
        await apiClient.delete(`/item-categories/${sub.id}`)
      } catch {
        const suffix = String(sub.id).slice(-6).toUpperCase()
        await apiClient
          .patch(`/item-categories/${sub.id}`, {
            name: `__DELETED_${suffix}`,
            parentId: null,
            status: "INACTIVE",
          })
          .catch(() => null)
      }
    }

    for (const parent of parentCats) {
      if (String(parent.name || "").startsWith("__DELETED_")) continue
      try {
        await apiClient.delete(`/item-categories/${parent.id}`)
      } catch {
        const suffix = String(parent.id).slice(-6).toUpperCase()
        await apiClient
          .patch(`/item-categories/${parent.id}`, {
            name: `__DELETED_${suffix}`,
            parentId: null,
            status: "INACTIVE",
          })
          .catch(() => null)
      }
    }
  } catch {
    // Non-fatal background cleanup
  }
}

export function filterCategoriesResponse(responseData) {
  purgeLegacyComputerCatalogInBackground()

  if (!responseData) return responseData
  const data = responseData.data || responseData

  const cleanCategory = (cat) => {
    const cleanedSubs = Array.isArray(cat.subcategories)
      ? cat.subcategories.filter((sub) => !isDeletedOrLegacyCategory(sub))
      : undefined
    return {
      ...cat,
      ...(cleanedSubs !== undefined ? { subcategories: cleanedSubs } : {}),
    }
  }

  if (Array.isArray(data?.items)) {
    const filtered = data.items
      .filter((cat) => !isDeletedOrLegacyCategory(cat))
      .map(cleanCategory)
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
      data: data.filter((cat) => !isDeletedOrLegacyCategory(cat)).map(cleanCategory),
    }
  }

  return responseData
}

export function filterItemsResponse(responseData) {
  purgeLegacyComputerCatalogInBackground()

  if (!responseData) return responseData
  const data = responseData.data || responseData

  if (Array.isArray(data?.items)) {
    const filtered = data.items.filter((item) => !isDeletedOrLegacyItem(item))
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
      data: data.filter((item) => !isDeletedOrLegacyItem(item)),
    }
  }

  return responseData
}

