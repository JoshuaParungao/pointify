// POSynctify IndexedDB Offline Database Helper
// Provides resilient client-side storage for catalog caching and offline sales queue

const DB_NAME = "posynctify_offline_pos_db"
const DB_VERSION = 1

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"))
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // 1. Catalog store
      if (!db.objectStoreNames.contains("catalog")) {
        const catalogStore = db.createObjectStore("catalog", { keyPath: "id" })
        catalogStore.createIndex("itemCode", "itemCode", { unique: false })
        catalogStore.createIndex("barcode", "barcode", { unique: false })
        catalogStore.createIndex("itemName", "itemName", { unique: false })
      }

      // 2. Customers store
      if (!db.objectStoreNames.contains("customers")) {
        const customerStore = db.createObjectStore("customers", { keyPath: "id" })
        customerStore.createIndex("fullName", "fullName", { unique: false })
        customerStore.createIndex("mobileNumber", "mobileNumber", { unique: false })
      }

      // 3. Outbox sales store (pending offline transactions)
      if (!db.objectStoreNames.contains("offlineSales")) {
        const salesStore = db.createObjectStore("offlineSales", { keyPath: "clientSaleId" })
        salesStore.createIndex("status", "status", { unique: false })
        salesStore.createIndex("createdAt", "createdAt", { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Generic transaction helper
async function withStore(storeName, mode, callback) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)

    let result
    try {
      result = callback(store)
    } catch (err) {
      return reject(err)
    }

    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
  })
}

// ----------------- CATALOG OPERATIONS -----------------

export async function cacheCatalogItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("catalog", "readwrite")
    const store = tx.objectStore("catalog")

    for (const item of items) {
      if (item && item.id) {
        store.put(item)
      }
    }

    tx.oncomplete = () => resolve(items.length)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedCatalog() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("catalog", "readonly")
    const store = tx.objectStore("catalog")
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

// ----------------- CUSTOMER OPERATIONS -----------------

export async function cacheCustomers(customers = []) {
  if (!Array.isArray(customers) || customers.length === 0) return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("customers", "readwrite")
    const store = tx.objectStore("customers")

    for (const c of customers) {
      if (c && c.id) {
        store.put(c)
      }
    }

    tx.oncomplete = () => resolve(customers.length)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedCustomers() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("customers", "readonly")
    const store = tx.objectStore("customers")
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

// ----------------- OFFLINE SALES QUEUE -----------------

export async function enqueueOfflineSale(saleRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSales", "readwrite")
    const store = tx.objectStore("offlineSales")
    store.put(saleRecord)

    tx.oncomplete = () => resolve(saleRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflineSales() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSales", "readonly")
    const store = tx.objectStore("offlineSales")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      // Return records that are not SYNCED
      const pending = all.filter((s) => s.status === "PENDING" || s.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getAllOfflineSales() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSales", "readonly")
    const store = tx.objectStore("offlineSales")
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineSale(clientSaleId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSales", "readwrite")
    const store = tx.objectStore("offlineSales")
    const getReq = store.get(clientSaleId)

    getReq.onsuccess = () => {
      const record = getReq.result
      if (!record) return resolve(null)
      const updated = { ...record, ...patch, updatedAt: new Date().toISOString() }
      store.put(updated)
      resolve(updated)
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function getOfflineQueueCount() {
  const pending = await getPendingOfflineSales()
  return pending.length
}
