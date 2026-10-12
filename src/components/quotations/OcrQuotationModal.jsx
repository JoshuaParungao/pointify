import { useState, useRef } from "react"
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  RefreshCw,
  Search,
  ShoppingCart,
  User,
  Phone,
  Calendar,
  Layers,
} from "lucide-react"
import { parseQuotationPdfWithOcr } from "../../features/quotations/quotations.api"

export default function OcrQuotationModal({
  isOpen,
  onClose,
  branchId,
  onImportToQuotation,
  onDirectPosCheckout,
}) {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf" || droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(droppedFile)
        setErrorMsg("")
      } else {
        setErrorMsg("Please upload a valid PDF document.")
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(selectedFile)
        setErrorMsg("")
      } else {
        setErrorMsg("Please upload a valid PDF document.")
      }
    }
  }

  const handleProcessOcr = async () => {
    if (!file) {
      setErrorMsg("Please choose or drop a Quotation PDF file first.")
      return
    }

    setIsProcessing(true)
    setErrorMsg("")

    try {
      const response = await parseQuotationPdfWithOcr(file, branchId)
      if (response && response.success && response.data) {
        setExtractedData(response.data)
      } else {
        throw new Error(response?.message || "Failed to parse quotation PDF.")
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while running OCR on the quotation PDF."
      setErrorMsg(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setExtractedData(null)
    setErrorMsg("")
  }

  const handleApplyToQuotation = () => {
    if (!extractedData) return
    onImportToQuotation(extractedData)
    onClose()
  }

  const handleApplyToPos = () => {
    if (!extractedData) return
    if (onDirectPosCheckout) {
      onDirectPosCheckout(extractedData)
    } else {
      onImportToQuotation(extractedData)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-soft)]/50 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[var(--color-primary)] text-white shadow-soft">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-[var(--color-text-strong)] sm:text-lg">
                  OCR-Assisted Quotation Processing
                </h2>
                <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                  Intelligent Parser
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Upload customer or supplier Quotation PDFs to automatically extract items, quantities, and pricing.
              </p>
            </div>
          </div>

          <button
            className="grid size-9 place-items-center rounded-xl bg-slate-200/50 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {!extractedData ? (
            /* Upload Stage */
            <div className="space-y-4">
              <div
                className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/40"
                    : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />

                <div className="grid size-16 place-items-center rounded-3xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-inner">
                  <UploadCloud className="size-8" />
                </div>

                <h3 className="mt-4 text-base font-bold text-[var(--color-text-strong)]">
                  {file ? file.name : "Drag and drop your Quotation PDF here"}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-muted)] max-w-sm">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB • Ready for OCR document extraction`
                    : "Supports standard customer quotations, medical supplies quotation sheets, and vendor price estimates."}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-xs font-bold text-[var(--color-text-strong)] shadow-xs transition hover:bg-[var(--color-soft)]"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <FileText size={14} />
                    {file ? "Choose Another File" : "Browse PDF File"}
                  </button>

                  {file ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2 text-xs font-bold text-white shadow-soft transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                      disabled={isProcessing}
                      onClick={handleProcessOcr}
                      type="button"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Running OCR Extraction...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Scan & Extract Items
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/40 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)]">
                  How Pointify OCR Works
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-[var(--color-muted)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Automatically identifies customer details, quotation dates, and reference numbers.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Extracts line items, quantities, and unit prices, matching them with current inventory.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Eliminates tedious manual re-encoding directly before quotation generation or digital checkout.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* Results Review Stage */
            <div className="space-y-5">
              {/* Extraction Header Summary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Quotation Info */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
                    <Calendar size={14} />
                    <span>Quotation Details</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-[var(--color-text-strong)]">
                    {extractedData.documentInfo?.quotationNumber || "Auto-Generated Reference"}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Date: {extractedData.documentInfo?.date || "Today"}
                  </p>
                </div>

                {/* Customer Info */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
                    <User size={14} />
                    <span>Customer Information</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-[var(--color-text-strong)]">
                    {extractedData.customer?.name || "Walk-in Customer"}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {extractedData.customer?.contactNumber || "No contact phone"}
                  </p>
                  {extractedData.matchedCustomer ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 size={10} /> Matched in Customer Directory
                    </span>
                  ) : null}
                </div>

                {/* Financial Summary */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
                    <ShoppingCart size={14} />
                    <span>Total Quoted Amount</span>
                  </div>
                  <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
                    ₱{Number(extractedData.financials?.totalAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {extractedData.items?.length || 0} line item(s) detected
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
                <div className="border-b border-[var(--color-border)] bg-[var(--color-soft)]/60 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-strong)]">
                    Extracted Line Items ({extractedData.items?.length || 0})
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--color-muted)]">
                    Verified against Pointify Inventory
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[var(--color-border)] bg-slate-50/70 font-bold text-[var(--color-muted)] dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-2">Item Description</th>
                        <th className="px-3 py-2 text-center">Catalog Match</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {extractedData.items && extractedData.items.length > 0 ? (
                        extractedData.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <td className="px-4 py-2.5">
                              <p className="font-bold text-[var(--color-text-strong)]">
                                {item.rawDescription}
                              </p>
                              {item.matchedItemName ? (
                                <p className="text-[11px] text-[var(--color-muted)]">
                                  Catalog: {item.matchedItemName} ({item.matchedItemCode})
                                </p>
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {item.isCatalogMatch ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                  <CheckCircle2 size={10} />
                                  Match
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                  Custom Item
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono">
                              ₱{Number(item.unitPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-[var(--color-text-strong)]">
                              ₱{Number(item.lineTotal || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-[var(--color-muted)]">
                            No individual table rows detected. You may still import document metadata.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-soft)]/50 px-6 py-4">
          {extractedData ? (
            <button
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-text-strong)]"
              onClick={handleReset}
              type="button"
            >
              <RefreshCw size={13} />
              Scan Another Document
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2.5 text-xs font-bold text-[var(--color-text-strong)] transition hover:bg-[var(--color-soft)]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>

            {extractedData ? (
              <>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-4 py-2.5 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                  onClick={handleApplyToQuotation}
                  type="button"
                >
                  <FileText size={14} />
                  Import into Quotation Builder
                </button>

                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-[var(--color-primary-hover)]"
                  onClick={handleApplyToPos}
                  type="button"
                >
                  <ShoppingCart size={14} />
                  Proceed to POS Checkout
                  <ArrowRight size={14} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
