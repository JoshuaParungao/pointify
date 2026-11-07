import { useState, useEffect, useRef } from "react"
import {
  QrCode,
  CreditCard,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  Copy,
  BellRing,
  Sparkles,
} from "lucide-react"
import {
  createPayMongoCheckoutSession,
  getPayMongoPaymentStatus,
  simulatePayMongoPayment,
} from "../../features/paymongo/paymongo.api"

/**
 * Dual-tone audio chime using Web Audio API
 */
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // 4-note ascending chord chime: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      const start = now + idx * 0.08
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.18, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)

      osc.start(start)
      osc.stop(start + 0.5)
    })
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}

/**
 * Dispatch desktop browser notification if permitted
 */
function sendDesktopNotification(title, body) {
  try {
    if (!("Notification" in window)) return
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body,
            icon: "/favicon.ico",
          })
        }
      })
    }
  } catch {
    // Silently ignore notification errors
  }
}

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("PENDING") // PENDING | PAID
  const [verifiedDetails, setVerifiedDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("QR_PH") // "QR_PH" | "CARD_CHECKOUT"

  const pollIntervalRef = useRef(null)

  // Initialize PayMongo Session when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setPaymentStatus("PENDING")
      setVerifiedDetails(null)
      setErrorMsg("")
      return
    }

    const numericAmount = typeof amount === "number"
      ? amount
      : parseFloat(String(amount || "").replace(/[^0-9.]/g, "")) || 0

    if (!numericAmount || numericAmount < 20) {
      setErrorMsg("PayMongo minimum transaction amount is ₱20.00.")
      return
    }

    // Request notification permission early
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }

    let isMounted = true

    async function initSession() {
      setIsLoading(true)
      setErrorMsg("")
      setSession(null)
      setPaymentStatus("PENDING")
      setActiveTab("QR_PH")

      try {
        const response = await createPayMongoCheckoutSession({
          amount: numericAmount,
          description: `Pointify Sale - Ref #${referenceNumber || "POS"}`,
          customerName: customerName || "Walk-in Customer",
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
          lineItems: (cartItems || []).map((line) => ({
            name: line.description || line.itemNameSnapshot || line.item?.itemName || "Item",
            quantity: Math.max(1, Number(line.quantity) || 1),
            amount: Number(line.unitPrice || line.customUnitPrice || line.item?.price1 || 0),
          })),
        })

        if (!isMounted) return

        if (response?.success && response?.data) {
          setSession(response.data)

          // Start polling for payment completion
          const sessionId = response.data.sessionId
          pollIntervalRef.current = setInterval(async () => {
            try {
              const statusRes = await getPayMongoPaymentStatus(sessionId)
              if (statusRes?.success && statusRes?.data?.status === "PAID") {
                clearInterval(pollIntervalRef.current)
                setPaymentStatus("PAID")
                setVerifiedDetails(statusRes.data)

                playSuccessChime()
                sendDesktopNotification(
                  "Pointify POS: Payment Received!",
                  `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} paid via ${statusRes.data.paymentMethod || "Digital Wallet"}.`
                )
              }
            } catch {
              // Ignore polling errors
            }
          }, 3000)
        } else {
          setErrorMsg(response?.message || "Could not generate PayMongo session. Demo mode is available.")
        }
      } catch (err) {
        if (!isMounted) return
        setErrorMsg(err?.response?.data?.message || err?.message || "Using demo mode for presentation.")
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

  if (!isOpen) return null

  const handleCopyLink = () => {
    const url = session?.checkoutUrl || `https://pointify.ph/pay/${referenceNumber || "demo"}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Instant confirmation for thesis / live defense demo
  const handleConfirmDemo = async (method = "GCASH") => {
    if (isProcessing) return
    setIsProcessing(true)
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

    const ref = `PM-${method}-${Date.now().toString().slice(-6)}`
    setPaymentStatus("PAID")
    setVerifiedDetails({
      paymentMethod: method,
      referenceNo: ref,
      sessionId: session?.sessionId || ref,
      amount: Number(amount),
    })

    playSuccessChime()
    sendDesktopNotification(
      "Pointify POS: Payment Received!",
      `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} received via ${method}.`
    )

    // Notify parent to complete sale and display receipt
    if (onPaymentSuccess) {
      try {
        await onPaymentSuccess({
          paymentMethod: method,
          referenceNo: ref,
          remarks: `[PayMongo QR Ph Confirmed: ${method}]`,
          amount: Number(amount),
        })
      } catch (err) {
        setErrorMsg(err?.message || "Failed to auto-complete sale.")
        setIsProcessing(false)
        return
      }
    }

    setIsProcessing(false)
    onClose()
  }

  const handleFinishAndComplete = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    if (onPaymentSuccess) {
      try {
        await onPaymentSuccess({
          paymentMethod: verifiedDetails?.paymentMethod === "CARD" ? "CARD" : "GCASH",
          referenceNo: verifiedDetails?.referenceNo || verifiedDetails?.sessionId || session?.sessionId || referenceNumber,
          remarks: `[PayMongo Verified: ${verifiedDetails?.paymentMethod || "GCASH"}]`,
          amount: Number(amount),
        })
      } catch (err) {
        setErrorMsg(err?.message || "Failed to auto-complete sale.")
        setIsProcessing(false)
        return
      }
    }
    setIsProcessing(false)
    onClose()
  }

  const qrImageUrl = session?.checkoutUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        session.checkoutUrl
      )}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `POINTIFY-QRPH-PAY-${referenceNumber || "DEMO"}-AMOUNT-${amount}`
      )}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              PayMongo Digital
            </h3>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
              QR Ph Demo
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-5 pb-5">
          {paymentStatus === "PAID" ? (
            /* Paid Confirmation View */
            <div className="py-2 text-center animate-in fade-in duration-200">
              <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <BellRing size={13} className="text-emerald-600 animate-bounce" />
                <span>Payment received & confirmed in system!</span>
              </div>

              <div className="mx-auto size-12 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 size={24} />
              </div>

              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Payment Verified
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Paid via {verifiedDetails?.paymentMethod || "GCash"}
              </p>

              <div className="my-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 p-3 text-xs text-left divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between pb-2">
                  <span className="text-slate-400">Customer</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[170px]">
                    {customerName || "Walk-in Customer"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Method</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {verifiedDetails?.paymentMethod || "GCASH"}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-400">Reference No</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                    {verifiedDetails?.referenceNo || "PAID"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinishAndComplete}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>{isProcessing ? "Completing Sale & Issuing Receipt..." : "Proceed to Complete Sale"}</span>
              </button>
            </div>
          ) : (
            /* QR Display with Quick Confirmation for Demo */
            <div className="text-center">
              <div className="mb-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  Total Payable
                </span>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 my-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("QR_PH")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                    activeTab === "QR_PH"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>QR Ph (Wallets)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("CARD_CHECKOUT")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                    activeTab === "CARD_CHECKOUT"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Card / Checkout QR</span>
                </button>
              </div>

              {/* QR Image Container */}
              <div className="my-2 mx-auto w-fit p-3 bg-white rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                {isLoading ? (
                  <div className="size-40 flex flex-col items-center justify-center bg-slate-50 rounded-xl gap-2">
                    <Loader2 className="size-6 animate-spin text-emerald-600" />
                    <span className="text-[11px] text-slate-500">Loading QR...</span>
                  </div>
                ) : (
                  <img
                    alt={activeTab === "QR_PH" ? "QR Ph Code" : "Card Checkout QR"}
                    className="size-40 object-contain mx-auto"
                    src={qrImageUrl}
                  />
                )}
              </div>

              {/* Instruction depending on active tab */}
              <div className="mb-2 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Scan with GCash, Maya, or Bank App</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ready for scanning with any QR Ph enabled camera
                </p>
              </div>

              {/* PROMINENT DEMO CONFIRMATION BUTTON */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleConfirmDemo("GCASH")}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer my-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>{isProcessing ? "Completing Sale & Issuing Receipt..." : "Confirm Payment Received (Demo Checkout)"}</span>
              </button>

              {/* Other demo methods */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConfirmDemo("PAYMAYA")}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay with Maya
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConfirmDemo("CARD")}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay with Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Footer */}
        {paymentStatus !== "PAID" && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              PayMongo QR Ph Integrated
            </span>

            <button
              onClick={onClose}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
              type="button"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
