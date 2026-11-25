// POSynctify IndexedDB Offline Database Helper
// Comprehensive offline client-side storage & outbox queues
// Modules: Sales, Customers, Quotations, Service Jobs, Suppliers, Purchase Orders, and Receivings

const DB_NAME = "posynctify_offline_pos_db"
const DB_VERSION = 3

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

      // 3. Outbox sales store
      if (!db.objectStoreNames.contains("offlineSales")) {
        const salesStore = db.createObjectStore("offlineSales", { keyPath: "clientSaleId" })
        salesStore.createIndex("status", "status", { unique: false })
        salesStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 4. Outbox customers store
      if (!db.objectStoreNames.contains("offlineCustomers")) {
        const custStore = db.createObjectStore("offlineCustomers", { keyPath: "clientCustomerId" })
        custStore.createIndex("status", "status", { unique: false })
        custStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 5. Outbox quotations store
      if (!db.objectStoreNames.contains("offlineQuotations")) {
        const quoteStore = db.createObjectStore("offlineQuotations", { keyPath: "clientQuotationId" })
        quoteStore.createIndex("status", "status", { unique: false })
        quoteStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 6. Outbox service job orders store
      if (!db.objectStoreNames.contains("offlineJobOrders")) {
        const jobStore = db.createObjectStore("offlineJobOrders", { keyPath: "clientJobOrderId" })
        jobStore.createIndex("status", "status", { unique: false })
        jobStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 7. Suppliers cache store
      if (!db.objectStoreNames.contains("suppliers")) {
        const supStore = db.createObjectStore("suppliers", { keyPath: "id" })
        supStore.createIndex("name", "name", { unique: false })
        supStore.createIndex("contactPerson", "contactPerson", { unique: false })
      }

      // 8. Outbox suppliers store
      if (!db.objectStoreNames.contains("offlineSuppliers")) {
        const offSupStore = db.createObjectStore("offlineSuppliers", { keyPath: "clientSupplierId" })
        offSupStore.createIndex("status", "status", { unique: false })
        offSupStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 9. Outbox purchase orders store
      if (!db.objectStoreNames.contains("offlinePurchaseOrders")) {
        const offPoStore = db.createObjectStore("offlinePurchaseOrders", { keyPath: "clientPoId" })
        offPoStore.createIndex("status", "status", { unique: false })
        offPoStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 10. Outbox purchase receivings store
      if (!db.objectStoreNames.contains("offlineReceivings")) {
        const offRecStore = db.createObjectStore("offlineReceivings", { keyPath: "clientReceivingId" })
        offRecStore.createIndex("status", "status", { unique: false })
        offRecStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 11. Cached serials store (for offline serial monitoring & lookup)
      if (!db.objectStoreNames.contains("cachedSerials")) {
        const serialStore = db.createObjectStore("cachedSerials", { keyPath: "id" })
        serialStore.createIndex("serialNumber", "serialNumber", { unique: false })
        serialStore.createIndex("itemId", "itemId", { unique: false })
        serialStore.createIndex("status", "status", { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
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

export async function putCachedCustomer(customer) {
  if (!customer?.id) return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("customers", "readwrite")
    const store = tx.objectStore("customers")
    store.put(customer)
    tx.oncomplete = () => resolve(customer)
    tx.onerror = () => reject(tx.error)
  })
}

// ----------------- SUPPLIER OPERATIONS -----------------

export async function cacheSuppliers(suppliers = []) {
  if (!Array.isArray(suppliers) || suppliers.length === 0) return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("suppliers", "readwrite")
    const store = tx.objectStore("suppliers")

    for (const s of suppliers) {
      if (s && s.id) {
        store.put(s)
      }
    }

    tx.oncomplete = () => resolve(suppliers.length)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedSuppliers() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("suppliers", "readonly")
    const store = tx.objectStore("suppliers")
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function putCachedSupplier(supplier) {
  if (!supplier?.id) return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("suppliers", "readwrite")
    const store = tx.objectStore("suppliers")
    store.put(supplier)
    tx.oncomplete = () => resolve(supplier)
    tx.onerror = () => reject(tx.error)
  })
}

// ----------------- CACHED SERIALS OPERATIONS -----------------

export async function cacheSerials(serials = []) {
  if (!Array.isArray(serials) || serials.length === 0) return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cachedSerials", "readwrite")
    const store = tx.objectStore("cachedSerials")

    for (const s of serials) {
      if (s && s.id) {
        store.put(s)
      }
    }

    tx.oncomplete = () => resolve(serials.length)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedSerials(searchTerm = "") {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cachedSerials", "readonly")
    const store = tx.objectStore("cachedSerials")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      if (!searchTerm || !searchTerm.trim()) {
        return resolve(all)
      }
      const term = searchTerm.trim().toLowerCase()
      const filtered = all.filter(
        (s) =>
          String(s.serialNumber || "").toLowerCase().includes(term) ||
          String(s.item?.itemName || "").toLowerCase().includes(term) ||
          String(s.item?.itemCode || "").toLowerCase().includes(term)
      )
      resolve(filtered)
    }
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
      const pending = all.filter((s) => s.status === "PENDING" || s.status === "FAILED")
      resolve(pending)
    }
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

// ----------------- OFFLINE CUSTOMERS QUEUE -----------------

export async function enqueueOfflineCustomer(custRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineCustomers", "readwrite")
    const store = tx.objectStore("offlineCustomers")
    store.put(custRecord)

    tx.oncomplete = () => resolve(custRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflineCustomers() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineCustomers", "readonly")
    const store = tx.objectStore("offlineCustomers")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((c) => c.status === "PENDING" || c.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineCustomer(clientCustomerId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineCustomers", "readwrite")
    const store = tx.objectStore("offlineCustomers")
    const getReq = store.get(clientCustomerId)

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

// ----------------- OFFLINE QUOTATIONS QUEUE -----------------

export async function enqueueOfflineQuotation(quoteRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineQuotations", "readwrite")
    const store = tx.objectStore("offlineQuotations")
    store.put(quoteRecord)

    tx.oncomplete = () => resolve(quoteRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflineQuotations() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineQuotations", "readonly")
    const store = tx.objectStore("offlineQuotations")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((q) => q.status === "PENDING" || q.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineQuotation(clientQuotationId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineQuotations", "readwrite")
    const store = tx.objectStore("offlineQuotations")
    const getReq = store.get(clientQuotationId)

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

// ----------------- OFFLINE JOB ORDERS QUEUE -----------------

export async function enqueueOfflineJobOrder(jobRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineJobOrders", "readwrite")
    const store = tx.objectStore("offlineJobOrders")
    store.put(jobRecord)

    tx.oncomplete = () => resolve(jobRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflineJobOrders() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineJobOrders", "readonly")
    const store = tx.objectStore("offlineJobOrders")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((j) => j.status === "PENDING" || j.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineJobOrder(clientJobOrderId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineJobOrders", "readwrite")
    const store = tx.objectStore("offlineJobOrders")
    const getReq = store.get(clientJobOrderId)

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

// ----------------- OFFLINE SUPPLIERS QUEUE -----------------

export async function enqueueOfflineSupplier(supRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSuppliers", "readwrite")
    const store = tx.objectStore("offlineSuppliers")
    store.put(supRecord)

    tx.oncomplete = () => resolve(supRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflineSuppliers() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSuppliers", "readonly")
    const store = tx.objectStore("offlineSuppliers")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((s) => s.status === "PENDING" || s.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineSupplier(clientSupplierId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineSuppliers", "readwrite")
    const store = tx.objectStore("offlineSuppliers")
    const getReq = store.get(clientSupplierId)

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

// ----------------- OFFLINE PURCHASE ORDERS QUEUE -----------------

export async function enqueueOfflinePurchaseOrder(poRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlinePurchaseOrders", "readwrite")
    const store = tx.objectStore("offlinePurchaseOrders")
    store.put(poRecord)

    tx.oncomplete = () => resolve(poRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflinePurchaseOrders() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlinePurchaseOrders", "readonly")
    const store = tx.objectStore("offlinePurchaseOrders")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((p) => p.status === "PENDING" || p.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflinePurchaseOrder(clientPoId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlinePurchaseOrders", "readwrite")
    const store = tx.objectStore("offlinePurchaseOrders")
    const getReq = store.get(clientPoId)

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

// ----------------- OFFLINE PURCHASE RECEIVINGS QUEUE -----------------

export async function enqueueOfflineReceiving(recRecord) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineReceivings", "readwrite")
    const store = tx.objectStore("offlineReceivings")
    store.put(recRecord)

    tx.oncomplete = () => resolve(recRecord)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOfflineReceivings() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineReceivings", "readonly")
    const store = tx.objectStore("offlineReceivings")
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((r) => r.status === "PENDING" || r.status === "FAILED")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function updateOfflineReceiving(clientReceivingId, patch) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offlineReceivings", "readwrite")
    const store = tx.objectStore("offlineReceivings")
    const getReq = store.get(clientReceivingId)

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

// ----------------- QUEUE SUMMARY COUNT -----------------

export async function getOfflineQueueCount() {
  try {
    const [sales, custs, quotes, jobs, sups, pos, recs] = await Promise.all([
      getPendingOfflineSales().catch(() => []),
      getPendingOfflineCustomers().catch(() => []),
      getPendingOfflineQuotations().catch(() => []),
      getPendingOfflineJobOrders().catch(() => []),
      getPendingOfflineSuppliers().catch(() => []),
      getPendingOfflinePurchaseOrders().catch(() => []),
      getPendingOfflineReceivings().catch(() => []),
    ])
    return (
      sales.length +
      custs.length +
      quotes.length +
      jobs.length +
      sups.length +
      pos.length +
      recs.length
    )
  } catch {
    return 0
  }
}
