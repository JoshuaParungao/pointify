import apiClient from "../../lib/apiClient"

/**
 * Create a PayMongo checkout session for digital payments
 */
export async function createPayMongoCheckoutSession(payload) {
  const response = await apiClient.post("/payments/paymongo/checkout-session", payload)
  return response.data
}

/**
 * Check real-time payment status of a PayMongo session
 */
export async function getPayMongoPaymentStatus(sessionId) {
  const response = await apiClient.get(`/payments/paymongo/status/${sessionId}`)
  return response.data
}

/**
 * Sandbox helper: Simulate customer payment for presentation/testing
 */
export async function simulatePayMongoPayment(sessionId, paymentMethod = "GCASH") {
  const response = await apiClient.post(`/payments/paymongo/simulate/${sessionId}`, {
    paymentMethod,
  })
  return response.data
}
