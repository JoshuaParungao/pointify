import apiClient from "../../lib/apiClient"

export async function getQuotations(params = {}) {
  const response = await apiClient.get("/quotations", { params })
  return response.data
}

export async function getQuotationServiceStaff(params = {}) {
  const response = await apiClient.get("/quotations/service-staff", { params })
  return response.data
}

export async function getQuotationById(id) {
  const response = await apiClient.get(`/quotations/${id}`)
  return response.data
}

export async function createQuotation(payload) {
  const response = await apiClient.post("/quotations", payload)
  return response.data
}

export async function updateQuotation(id, payload) {
  const response = await apiClient.patch(`/quotations/${id}`, payload)
  return response.data
}

export async function updateQuotationStatus(id, payload) {
  const response = await apiClient.patch(`/quotations/${id}/status`, payload)
  return response.data
}

function parseMoney(val) {
  if (typeof val === "number") return val
  if (!val) return 0
  const cleaned = String(val).replace(/[^0-9.-]+/g, "")
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100
}

function stripItemSuffixes(desc) {
  return String(desc || "")
    .replace(/\s*\|\s*\d+\s*(?:days?|months?|years?|mos?|yrs?)\s*(?:warranty|return|exchange).*$/i, "")
    .replace(/\s*\|\s*(?:no\s*warranty|with\s*warranty|service\s*warranty|replacement\s*part).*$/i, "")
    .replace(/\s*S\/N:\s*.+$/i, "")
    .trim()
}

function calculateSimilarity(str1, str2) {
  const s1 = stripItemSuffixes(str1).toLowerCase().trim()
  const s2 = stripItemSuffixes(str2).toLowerCase().trim()
  if (!s1 || !s2) return 0
  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.85

  const tokens1 = new Set(s1.split(/[\s\-_,./|()]+/).filter((t) => t.length > 1))
  const tokens2 = new Set(s2.split(/[\s\-_,./|()]+/).filter((t) => t.length > 1))
  let intersection = 0
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++
  }
  const union = tokens1.size + tokens2.size - intersection
  return union > 0 ? intersection / union : 0
}

async function decompressBytes(bytes, format) {
  if (typeof DecompressionStream === "undefined") return null
  try {
    const ds = new DecompressionStream(format)
    const writer = ds.writable.getWriter()
    writer.write(bytes)
    writer.close()
    const outBuffer = await new Response(ds.readable).arrayBuffer()
    return new TextDecoder("latin1").decode(outBuffer)
  } catch {
    return null
  }
}

async function extractTextFromPdfInBrowser(file) {
  const arrayBuffer = await file.arrayBuffer()
  const rawLatin1 = new TextDecoder("latin1").decode(arrayBuffer)
  const chunks = []
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  let match

  while ((match = streamRegex.exec(rawLatin1)) !== null) {
    const rawStream = match[1]
    const bytes = new Uint8Array(rawStream.length)
    for (let i = 0; i < rawStream.length; i++) {
      bytes[i] = rawStream.charCodeAt(i) & 0xff
    }

    let decoded =
      (await decompressBytes(bytes, "deflate")) ||
      (await decompressBytes(bytes, "deflate-raw")) ||
      rawStream

    if (decoded.includes("BT") || decoded.includes("Tj") || decoded.includes("TJ")) {
      const tjBlocks = decoded.match(/BT[\s\S]*?ET/g) || [decoded]
      for (const block of tjBlocks) {
        const strMatches = block.match(/\((?:\\.|[^\\()])*\)/g) || []
        if (strMatches.length > 0) {
          const textLine = strMatches
            .map((s) =>
              s
                .slice(1, -1)
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, " ")
                .replace(/\\t/g, " ")
                .replace(/\\\(/g, "(")
                .replace(/\\\)/g, ")")
                .replace(/\\\\/g, "\\")
            )
            .join(" ")
          chunks.push(textLine)
        }
      }
    }
  }

  return chunks.join("\n")
}

function parseExtractedPdfText(rawText, filename = "") {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const documentInfo = {
    quotationNumber: "",
    date: "",
    validUntil: "",
    preparedBy: "",
    terms: "",
    rawTextLength: rawText.length,
  }
  const customer = {
    name: "",
    contactNumber: "",
    email: "",
    address: "",
  }
  const financials = {
    subtotal: 0,
    discount: 0,
    tax: 0,
    totalAmount: 0,
  }
  const items = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!documentInfo.quotationNumber) {
      const qMatch = line.match(
        /(?:quotation\s*(?:no\.?|number|#)|quote\s*(?:no\.?|#)|ref(?:erence)?\s*(?:no\.?|#))\s*[:\-]?\s*([A-Za-z0-9\-]+)/i
      )
      if (qMatch && qMatch[1] && !/^(date|valid|customer|page)$/i.test(qMatch[1])) {
        documentInfo.quotationNumber = qMatch[1].trim()
      } else if (/^no\.?\s*[:\-]?\s*(\d{3,10}|QTN-[A-Za-z0-9\-]+)$/i.test(line)) {
        const m = line.match(/^no\.?\s*[:\-]?\s*([A-Za-z0-9\-]+)$/i)
        if (m) documentInfo.quotationNumber = m[1].trim()
      }
    }

    if (!documentInfo.date) {
      const dateMatch = line.match(
        /(?:quotation\s*date|date\s*issued|date)\s*[:\-]?\s*([A-Za-z0-9\s,/\-]{6,20})/i
      )
      if (dateMatch && /\d/.test(dateMatch[1])) {
        documentInfo.date = dateMatch[1].trim()
      }
    }

    if (!customer.name) {
      const custMatch = line.match(
        /^(?:customer\s*name|client\s*name|customer|bill\s*to|prepared\s*for)\s*[:\-]\s*(.+)/i
      )
      if (custMatch && custMatch[1]) {
        const candidate = custMatch[1]
          .replace(/\s+(?:contact\s*no\.?|date|address|phone)\s*[:\-].*$/i, "")
          .trim()
        if (candidate && !/^(n\/a|none|-|walk[\s-]*in)$/i.test(candidate)) {
          customer.name = candidate
        }
      }
    }

    if (!customer.contactNumber) {
      const phoneMatch = line.match(
        /(?:contact\s*(?:no\.?|number)?|mobile|phone|tel(?:ephone)?)\s*[:\-]?\s*([+\d\s\-()]{7,20})/i
      )
      if (phoneMatch && phoneMatch[1]) {
        customer.contactNumber = phoneMatch[1].trim()
      }
    }

    if (!customer.address) {
      const addrMatch = line.match(/^address\s*[:\-]\s*(.+)/i)
      if (addrMatch && addrMatch[1]) {
        const candidate = addrMatch[1].replace(/\s+(?:date|quotation|no\.)\s*[:\-].*$/i, "").trim()
        if (candidate && candidate !== "-") {
          customer.address = candidate
        }
      }
    }

    const fiveNumsMatch = line.match(
      /^(.*?)\s+(\d+(?:\.\d+)?)\s+(?:php\s*|p\s*|₱\s*)?([\d,]+\.\d{2})\s+(?:php\s*|p\s*|₱\s*)?([\d,]+\.\d{2})\s+(?:php\s*|p\s*|₱\s*)?([\d,]+\.\d{2})\s+(?:php\s*|p\s*|₱\s*)?([\d,]+\.\d{2})$/i
    )
    if (fiveNumsMatch) {
      const prefix = fiveNumsMatch[1].trim()
      const qty = parseFloat(fiveNumsMatch[2])
      const cashPrice = parseMoney(fiveNumsMatch[5])
      const cashAmount = parseMoney(fiveNumsMatch[6])
      if (prefix && qty > 0 && cashPrice > 0) {
        const codeSplit = prefix.match(/^([A-Z]{2,6}-[A-Za-z0-9\-]+)\s+(.+)$/)
        items.push({
          rawItemCode: codeSplit ? codeSplit[1] : "",
          rawDescription: stripItemSuffixes(codeSplit ? codeSplit[2] : prefix),
          quantity: qty,
          unitPrice: cashPrice,
          lineTotal: cashAmount || Math.round(qty * cashPrice * 100) / 100,
        })
      }
    }
  }

  if (!documentInfo.quotationNumber && filename) {
    const fnMatch = String(filename).match(/(?:quotation|quote)[_\-\s#]*([A-Za-z0-9\-]+)/i)
    if (fnMatch && fnMatch[1]) {
      documentInfo.quotationNumber = fnMatch[1].replace(/\.pdf$/i, "").trim()
    }
  }

  return { documentInfo, customer, financials, items }
}

async function parseQuotationPdfClientFallback(file, branchId) {
  const rawText = await extractTextFromPdfInBrowser(file)
  const parsed = parseExtractedPdfText(rawText, file?.name || "")
  const { documentInfo, customer, financials } = parsed
  let { items } = parsed

  const params = branchId ? { branchId, limit: 200 } : { limit: 200 }
  const [quotationsRes, customersRes, itemsRes] = await Promise.all([
    apiClient.get("/quotations", { params }).catch(() => ({ data: null })),
    apiClient.get("/customers", { params }).catch(() => ({ data: null })),
    apiClient.get("/items", { params }).catch(() => ({ data: null })),
  ])

  const quotationRows =
    quotationsRes?.data?.data?.items ||
    quotationsRes?.data?.data?.quotations ||
    quotationsRes?.data?.data ||
    []
  const customerRows =
    customersRes?.data?.data?.items ||
    customersRes?.data?.data?.customers ||
    customersRes?.data?.data ||
    []
  const catalogItems =
    itemsRes?.data?.data?.items ||
    itemsRes?.data?.data ||
    []

  let matchedQuotation = null
  if (documentInfo.quotationNumber && Array.isArray(quotationRows)) {
    const cleanTarget = documentInfo.quotationNumber.replace(/^0+/, "") || "0"
    const summaryMatch = quotationRows.find((q) => {
      const code = String(q.quotationCode || "").trim()
      const cleanCode = code.replace(/^0+/, "") || "0"
      return (
        code.toLowerCase() === documentInfo.quotationNumber.toLowerCase() ||
        cleanCode === cleanTarget ||
        code.toLowerCase().endsWith(`-${cleanTarget}`)
      )
    })

    if (summaryMatch?.id) {
      const detailRes = await getQuotationById(summaryMatch.id).catch(() => null)
      matchedQuotation = detailRes?.data?.quotation || detailRes?.data || summaryMatch
    }
  }

  if (matchedQuotation) {
    documentInfo.quotationNumber = matchedQuotation.quotationCode || documentInfo.quotationNumber
    if (matchedQuotation.createdAt && !documentInfo.date) {
      documentInfo.date = new Date(matchedQuotation.createdAt).toLocaleDateString("en-PH")
    }
    if (!customer.name && matchedQuotation.customer?.fullName) {
      customer.name = matchedQuotation.customer.fullName
      customer.contactNumber = customer.contactNumber || matchedQuotation.customer.mobileNumber || ""
      customer.email = customer.email || matchedQuotation.customer.email || ""
      customer.address = customer.address || matchedQuotation.customer.address || ""
    }
    if (Array.isArray(matchedQuotation.items) && matchedQuotation.items.length > 0) {
      items = matchedQuotation.items.map((qi) => ({
        rawItemCode: qi.item?.itemCode || qi.itemCodeSnapshot || "",
        rawDescription: qi.item?.itemName || qi.itemNameSnapshot || qi.description || "Quotation Item",
        quantity: Number(qi.quantity || 1),
        unitPrice: Number(qi.unitPrice || 0),
        lineTotal: Number(qi.lineTotal || 0),
        matchedItemId: qi.itemId || qi.item?.id || null,
        matchedItemCode: qi.item?.itemCode || qi.itemCodeSnapshot || null,
        matchedItemName: qi.item?.itemName || qi.itemNameSnapshot || null,
      }))
      financials.subtotal = Number(matchedQuotation.subtotal || 0)
      financials.discount = Number(matchedQuotation.totalDiscount || 0)
      financials.totalAmount = Number(matchedQuotation.grandTotal || 0)
    }
  }

  let matchedCustomer = null
  if (matchedQuotation?.customer) {
    const ec = matchedQuotation.customer
    matchedCustomer = {
      id: ec.id,
      customerCode: ec.customerCode,
      fullName: ec.fullName,
      mobileNumber: ec.mobileNumber || customer.contactNumber,
      email: ec.email || customer.email,
      address: ec.address || customer.address,
      priceTier: ec.priceTier || 1,
      matchConfidence: 1.0,
    }
  } else if (customer.name && Array.isArray(customerRows)) {
    let bestSim = 0
    for (const ec of customerRows) {
      const sim = calculateSimilarity(ec.fullName, customer.name)
      if (sim >= 0.7 && sim > bestSim) {
        bestSim = sim
        matchedCustomer = {
          id: ec.id,
          customerCode: ec.customerCode,
          fullName: ec.fullName,
          mobileNumber: ec.mobileNumber || customer.contactNumber,
          email: ec.email || customer.email,
          address: ec.address || customer.address,
          priceTier: ec.priceTier || 1,
          matchConfidence: sim,
        }
      }
    }
  }

  const enrichedItems = items.map((item) => {
    if (item.matchedItemId) {
      const ci = Array.isArray(catalogItems)
        ? catalogItems.find((c) => c.id === item.matchedItemId)
        : null
      return {
        ...item,
        matchedItemId: item.matchedItemId,
        matchedItemCode: ci?.itemCode || item.matchedItemCode || item.rawItemCode || "",
        matchedItemName: ci?.itemName || item.matchedItemName || item.rawDescription,
        catalogPrice: Number(ci?.price1 ?? item.unitPrice ?? 0),
        matchConfidence: 1.0,
        isCatalogMatch: true,
      }
    }

    let bestMatch = null
    let highestSim = 0
    if (Array.isArray(catalogItems)) {
      for (const ci of catalogItems) {
        const exactCode =
          item.rawItemCode &&
          ci.itemCode &&
          ci.itemCode.toLowerCase() === item.rawItemCode.toLowerCase()
            ? 1.0
            : 0
        const simName = calculateSimilarity(ci.itemName, item.rawDescription)
        const sim = Math.max(exactCode, simName)
        if (sim > highestSim && sim >= 0.5) {
          highestSim = sim
          bestMatch = ci
        }
      }
    }

    if (bestMatch) {
      return {
        ...item,
        matchedItemId: bestMatch.id,
        matchedItemCode: bestMatch.itemCode,
        matchedItemName: bestMatch.itemName,
        catalogPrice: Number(bestMatch.price1 || item.unitPrice || 0),
        matchConfidence: highestSim,
        isCatalogMatch: true,
      }
    }

    return {
      ...item,
      matchedItemId: null,
      matchedItemCode: null,
      matchedItemName: null,
      catalogPrice: item.unitPrice,
      matchConfidence: 0,
      isCatalogMatch: false,
    }
  })

  const computedSub = enrichedItems.reduce((sum, i) => sum + Number(i.lineTotal || 0), 0)
  if (financials.subtotal === 0 && computedSub > 0) financials.subtotal = computedSub
  if (financials.totalAmount === 0 && computedSub > 0) {
    financials.totalAmount = Math.max(0, financials.subtotal - financials.discount + financials.tax)
  }

  return {
    success: true,
    message: "Quotation PDF processed successfully",
    data: {
      documentInfo,
      customer,
      financials,
      matchedCustomer,
      matchedQuotationId: matchedQuotation?.id || null,
      items: enrichedItems,
    },
  }
}

export async function parseQuotationPdfWithOcr(file, branchId) {
  const formData = new FormData()
  formData.append("file", file)
  try {
    const response = await apiClient.post("/quotations/ocr-parse", formData, {
      params: branchId ? { branchId } : {},
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (err) {
    if (!err?.response || err.response.status >= 500) {
      return parseQuotationPdfClientFallback(file, branchId)
    }
    throw err
  }
}
