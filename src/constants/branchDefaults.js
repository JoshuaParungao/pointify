export const BRANCH_DEFAULTS = {
  MAIN: {
    name: "Branch 1",
    address: "Branch 1 Commercial Center, Main District",
    contactNo: "0961-000-0001",
  },
  MAB: {
    name: "Branch 2",
    address: "Branch 2 Commercial Center, City District",
    contactNo: "0961-000-0002",
  },
}

export function getBranchDisplayName(branch) {
  if (!branch) return "Branch 1"
  const identifier = String(branch?.code || branch?.name || "").toUpperCase()
  if (identifier.includes("MAB") || identifier.includes("BRANCH 2") || identifier.includes("BRANCH-2")) {
    return "Branch 2"
  }
  if (identifier.includes("MAIN") || identifier.includes("BRANCH 1") || identifier.includes("BRANCH-1")) {
    return "Branch 1"
  }
  return branch.name || "Branch 1"
}

export function getBranchAddress(branch) {
  if (
    branch?.address &&
    typeof branch.address === "string" &&
    branch.address.trim() &&
    branch.address !== "-" &&
    branch.address !== "—" &&
    !branch.address.toLowerCase().includes("no address") &&
    !branch.address.toLowerCase().includes("san fernando") &&
    !branch.address.toLowerCase().includes("mabalacat")
  ) {
    return branch.address.trim()
  }
  const identifier = String(branch?.code || branch?.name || "").toUpperCase()
  if (identifier.includes("MAB") || identifier.includes("2")) {
    return BRANCH_DEFAULTS.MAB.address
  }
  return BRANCH_DEFAULTS.MAIN.address
}

export function getBranchContact(branch) {
  if (
    branch?.contactNo &&
    typeof branch.contactNo === "string" &&
    branch.contactNo.trim() &&
    branch.contactNo !== "-" &&
    branch.contactNo !== "—" &&
    !branch.contactNo.toLowerCase().includes("no contact")
  ) {
    return branch.contactNo.trim()
  }
  const identifier = String(branch?.code || branch?.name || "").toUpperCase()
  if (identifier.includes("MAB") || identifier.includes("2")) {
    return BRANCH_DEFAULTS.MAB.contactNo
  }
  return BRANCH_DEFAULTS.MAIN.contactNo
}
