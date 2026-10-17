import { useState, useEffect, useRef } from "react"
import {
  QrCode,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Copy,
} from "lucide-react"
import {
  createPayMongoCheckoutSession,
  getPayMongoPaymentStatus,
  simulatePayMongoPayment,
} from "../../features/paymongo/paymongo.api"

export default function PayMongoCheckoutModal({
  isOpen,
  onClose,
  amount,
  referenceNumber,
  customerName,
  customerPhone,
  customerEmail,
  cartItems = [],
  onPaymentSuccess,
}) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("PENDING") // PENDING | PAID | EXPIRED
  const [verifiedDetails, setVerifiedDetails] = useState(null)

  const pollIntervalRef = useRef(null)

  // Initialize PayMongo Session when modal opens
  useEffect(() => {
    if (!isOpen) return

    if (!amount || Number(amount) < 20) {
      setErrorMsg("PayMongo minimum transaction amount is ₱20.00.")
      return
    }

    let isMounted = true

    async function initSession() {
      setIsLoading(true)
      setErrorMsg("")
      setSession(null)
      setPaymentStatus("PENDING")

      try {
        const response = await createPayMongoCheckoutSession({
          amount: Number(amount),
          description: `Pointify Sale - Ref #${referenceNumber || "ORD"}`,
          referenceNumber,
          customerName: customerName || "Walk-in Customer",
          customerPhone: customerPhone || undefined,
          customerEmail: customerEmail || undefined,
          lineItems: (cartItems || []).map((item) => {
            const name =
              item.description ||
              item.itemName ||
              item.item?.itemName ||
              item.item?.description ||
              "Item"
            const unitPrice =
              Number(item.unitPrice) ||
              Number(item.price) ||
              Number(item.price1) ||
              Number(item.item?.[`price${item.priceTier || 1}`]) ||
              Number(item.item?.price1) ||
              0
            const quantity = Math.max(1, parseInt(item.quantity || 1, 10))
            return {
              name,
              unitPrice,
              quantity,
            }
          }),
        })

        if (isMounted && response?.success && response?.data) {
          setSession(response.data)
        } else {
          throw new Error(response?.message || "Failed to create PayMongo payment session.")
        }
      } catch (err) {
        if (isMounted) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to connect to PayMongo Sandbox."
          setErrorMsg(msg)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initSession()

    return () => {
      isMounted = false
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [isOpen, amount, referenceNumber, customerName, customerPhone, customerEmail, cartItems])

  // Polling for automated payment confirmation
  useEffect(() => {
    if (!session?.sessionId || paymentStatus === "PAID") return

    async function checkStatus() {
      try {
        const response = await getPayMongoPaymentStatus(session.sessionId)
        if (response?.success && response?.data?.isPaid) {
          setPaymentStatus("PAID")
          setVerifiedDetails(response.data)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch (err) {
        // silent polling error
      }
    }

    pollIntervalRef.current = setInterval(checkStatus, 3000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [session, paymentStatus])

  if (!isOpen) return null

  const handleCopyLink = () => {
    if (!session?.checkoutUrl) return
    navigator.clipboard.writeText(session.checkoutUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSimulate = async (method = "GCASH") => {
    if (!session?.sessionId) return
    setIsSimulating(true)
    try {
      const response = await simulatePayMongoPayment(session.sessionId, method)
      if (response?.success) {
        setPaymentStatus("PAID")
        setVerifiedDetails(response.data)
      }
    } catch (err) {
      alert("Failed to simulate payment: " + (err.message || "Unknown error"))
    } finally {
      setIsSimulating(false)
    }
  }

  const handleFinishAndComplete = () => {
    if (paymentStatus !== "PAID") return
    onPaymentSuccess({
      paymentMethod: verifiedDetails?.paymentMethod === "GCASH" ? "GCASH" : "OTHER",
      referenceNo: verifiedDetails?.sessionId || session?.sessionId || referenceNumber,
      remarks: `[PayMongo Verified: ${verifiedDetails?.paymentMethod || "SANDBOX"}]`,
      amount: Number(amount),
    })
    onClose()
  }

  const qrImageUrl = session?.checkoutUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        session.checkoutUrl
      )}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-soft)]/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[#00D09C] text-slate-950 font-black shadow-soft">
              <QrCode className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-[var(--color-text-strong)]">
                  PayMongo Digital Payment
                </h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                  Sandbox Active
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                QR Ph • GCash • Maya • Debit & Credit Card Integration
              </p>
            </div>
          </div>

          <button
            className="grid size-8 place-items-center rounded-xl bg-slate-200/50 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="size-10 animate-spin text-[var(--color-primary)]" />
              <p className="mt-4 text-sm font-bold text-[var(--color-text-strong)]">
                Generating Secure PayMongo QR Ph Session...
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Communicating with PayMongo API Sandbox
              </p>
            </div>
          ) : paymentStatus === "PAID" ? (
            /* Paid Confirmation Screen */
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-soft">
                <CheckCircle2 className="size-12 animate-pulse" />
              </div>

              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Payment Verified
                </span>
                <h4 className="mt-2 text-2xl font-black text-[var(--color-text-strong)]">
                  ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </h4>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Payment successfully received & verified via PayMongo {verifiedDetails?.paymentMethod || "QR Ph"}!
                </p>
              </div>

              <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-left text-xs space-y-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Payment Method:</span>
                  <span className="font-bold text-[var(--color-text-strong)]">
                    {verifiedDetails?.paymentMethod || "GCASH / QR PH"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">PayMongo Session ID:</span>
                  <span className="font-mono font-bold text-[var(--color-text-strong)]">
                    {session?.sessionId || "cs_test_..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Customer:</span>
                  <span className="font-bold text-[var(--color-text-strong)]">
                    {customerName || "Walk-in Customer"}
                  </span>
                </div>
              </div>
            </div>
          ) : session ? (
            /* QR / Payment Prompt Screen */
            <div className="space-y-6">
              {/* Amount Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/50 p-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-muted)]">Amount Due</p>
                  <p className="text-2xl font-black text-[var(--color-primary)]">
                    ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[var(--color-muted)]">Reference</p>
                  <p className="text-xs font-mono font-bold text-[var(--color-text-strong)]">
                    {referenceNumber || "ORD-LIVE"}
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-white p-6 text-center shadow-soft">
                {qrImageUrl ? (
                  <img
                    alt="PayMongo QR Code"
                    className="size-48 rounded-2xl border border-slate-100 p-2 shadow-xs object-contain"
                    src={qrImageUrl}
                  />
                ) : (
                  <div className="size-48 grid place-items-center bg-slate-100 rounded-2xl">
                    <QrCode className="size-16 text-slate-400" />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-pulse">
                  <span className="size-2 rounded-full bg-emerald-500"></span>
                  Listening for customer scan & payment...
                </div>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Customer can scan using GCash, Maya, or any QR Ph enabled banking app.
                </p>

                {/* External Link Option */}
                <div className="mt-4 flex items-center gap-2">
                  <a
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                    href={session.checkoutUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={12} />
                    Open PayMongo Checkout Page
                  </a>

                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    onClick={handleCopyLink}
                    type="button"
                  >
                    <Copy size={12} />
                    {copiedLink ? "Link Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Sandbox Quick Simulator for Thesis / Demo */}
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Thesis Sandbox Demo Simulator
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold dark:text-amber-400">
                    Instant Simulation
                  </span>
                </div>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-400/90 leading-relaxed">
                  Para sa panel presentation, maaari mong i-simulate ang customer payment nang hindi kailangang mag-login sa tunay na GCash app:
                </p>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={isSimulating}
                    onClick={() => handleSimulate("GCASH")}
                    type="button"
                  >
                    <Smartphone size={13} />
                    Simulate GCash Paid
                  </button>

                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition disabled:opacity-50"
                    disabled={isSimulating}
                    onClick={() => handleSimulate("PAYMAYA")}
                    type="button"
                  >
                    <Smartphone size={13} />
                    Simulate Maya Paid
                  </button>

                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition disabled:opacity-50"
                    disabled={isSimulating}
                    onClick={() => handleSimulate("CARD")}
                    type="button"
                  >
                    <CreditCard size={13} />
                    Simulate Card Paid
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-soft)]/50 px-6 py-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Encrypted PayMongo Sandbox Gateway</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-xs font-bold text-[var(--color-text-strong)] hover:bg-[var(--color-soft)]"
              onClick={onClose}
              type="button"
            >
              {paymentStatus === "PAID" ? "Close" : "Cancel"}
            </button>

            {paymentStatus === "PAID" ? (
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-soft hover:bg-emerald-700 transition"
                onClick={handleFinishAndComplete}
                type="button"
              >
                <CheckCircle2 size={14} />
                Complete POS Sale & Print Receipt
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
