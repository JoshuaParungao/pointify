import { useEffect, useState } from "react"

const STORAGE_KEY = "pointify_business_name"
export const DEFAULT_BUSINESS_NAME = "POINTIFY BUSINESS MANAGEMENT"

/**
 * Returns the currently active receipt business name.
 * Priority:
 * 1. Explicitly configured Business Name from Settings (localStorage/Database)
 * 2. Optional branch name if custom (not generic "Main Branch" / "Branch 1")
 * 3. Default fallback
 */
export function getReceiptBusinessName(branch = null, fallback = DEFAULT_BUSINESS_NAME) {
  try {
    const custom = localStorage.getItem(STORAGE_KEY)
    if (custom && custom.trim()) {
      return custom.trim()
    }
  } catch {
    // fallback if localStorage is inaccessible
  }

  if (
    branch?.name &&
    typeof branch.name === "string" &&
    branch.name.trim() &&
    branch.name !== "Main Branch" &&
    branch.name !== "Branch 1"
  ) {
    return branch.name.trim()
  }

  return fallback
}

/**
 * Persists the receipt business name and notifies all listening components.
 */
export function setReceiptBusinessName(name) {
  try {
    const clean = String(name || "").trim()
    if (clean) {
      localStorage.setItem(STORAGE_KEY, clean)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    window.dispatchEvent(
      new CustomEvent("pointify:business_name_changed", {
        detail: clean,
      })
    )
  } catch {
    // ignore storage errors
  }
}

/**
 * React hook that returns the active business name and re-renders whenever it changes.
 */
export function useReceiptBusinessName(branch = null, fallback = DEFAULT_BUSINESS_NAME) {
  const [businessName, setBusinessName] = useState(() =>
    getReceiptBusinessName(branch, fallback)
  )

  useEffect(() => {
    // Initial sync
    setBusinessName(getReceiptBusinessName(branch, fallback))

    const handleNameChanged = (event) => {
      const newName = event?.detail || getReceiptBusinessName(branch, fallback)
      setBusinessName(newName || getReceiptBusinessName(branch, fallback))
    }

    window.addEventListener("pointify:business_name_changed", handleNameChanged)
    return () => {
      window.removeEventListener("pointify:business_name_changed", handleNameChanged)
    }
  }, [branch, fallback])

  return businessName
}
