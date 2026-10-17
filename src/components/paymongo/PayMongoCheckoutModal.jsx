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
  } catch (err) {
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
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("PENDING") // PENDING | PAID
  const [verifiedDetails, setVerifiedDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("QR_PH") // "QR_PH" | "CARD_CHECKOUT"

  const pollIntervalRef = useRef(null)

  // Initialize PayMongo Session when modal opens
  useEffect(() => {
    if (!isOpen) return

    if (!amount || Number(amount) < 20) {
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

          // Play success chime & trigger notification
          playSuccessChime()
          sendDesktopNotification(
            "Pointify POS: Payment Received!",
            `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} paid via ${
              response.data.paymentMethod || "PayMongo"
            }.`
          )

          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch (err) {
        // silent polling error
      }
    }

    pollIntervalRef.current = setInterval(checkStatus, 2000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [session, paymentStatus, amount])

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

        // Play chime & desktop notification
        playSuccessChime()
        sendDesktopNotification(
          "Pointify POS: Payment Received!",
          `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} paid via ${method}.`
        )
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
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        session.checkoutUrl
      )}`
    : null

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
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              Sandbox
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
          {errorMsg ? (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Loader2 className="size-6 animate-spin text-slate-400" />
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                Generating QR Ph Session...
              </p>
            </div>
          ) : paymentStatus === "PAID" ? (
            /* Minimalist Paid Confirmation with Instant Alert Notification */
            <div className="py-2 text-center">
              {/* Notification Banner */}
              <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 animate-in fade-in duration-300">
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
                  <span className="text-slate-400">Session ID</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                    {session?.sessionId || "cs_..."}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishAndComplete}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                Complete POS Sale & Print Receipt
              </button>
            </div>
          ) : session ? (
            /* Minimalist QR Display with Tabs */
            <div className="text-center">
              {/* Amount Display */}
              <div className="py-1">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Amount Due
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₱{Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] font-mono text-slate-400">
                  {referenceNumber || "ORD-POS"}
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
              <div className="my-2.5 mx-auto w-fit p-3 bg-white rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                {qrImageUrl ? (
                  <img
                    alt={activeTab === "QR_PH" ? "QR Ph Code" : "Card Checkout QR"}
                    className="size-40 object-contain"
                    src={qrImageUrl}
                  />
                ) : (
                  <div className="size-40 grid place-items-center bg-slate-50 rounded-xl">
                    <QrCode className="size-12 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Instruction depending on active tab */}
              {activeTab === "QR_PH" ? (
                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Listening for wallet scan & payment...</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Scan using GCash, Maya, or any QR Ph enabled mobile app
                  </p>
                </div>
              ) : (
                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Scan to enter card details on customer's phone</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Or open the secure payment form directly on this device
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-2">
                <a
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
                  href={session.checkoutUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={12} />
                  <span>Open Checkout on PC</span>
                </a>

                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                  onClick={handleCopyLink}
                  type="button"
                >
                  <Copy size={12} />
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>
              </div>

              {/* Minimalist Sandbox Simulator */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sandbox Instant Testing
                  </span>
                  {isSimulating && (
                    <Loader2 size={11} className="animate-spin text-slate-400" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    className="rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 py-1.5 px-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition disabled:opacity-50 cursor-pointer"
                    disabled={isSimulating}
                    onClick={() => handleSimulate("GCASH")}
                    type="button"
                  >
                    GCash
                  </button>

                  <button
                    className="rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 py-1.5 px-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition disabled:opacity-50 cursor-pointer"
                    disabled={isSimulating}
                    onClick={() => handleSimulate("PAYMAYA")}
                    type="button"
                  >
                    Maya
                  </button>

                  <button
                    className="rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 py-1.5 px-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition disabled:opacity-50 cursor-pointer"
                    disabled={isSimulating}
                    onClick={() => handleSimulate("CARD")}
                    type="button"
                  >
                    Card
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Minimalist Footer */}
        {paymentStatus !== "PAID" && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck size={12} className="text-slate-400" />
              Encrypted Sandbox
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
