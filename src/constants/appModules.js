import { USER_ROLES } from "./roles"

const OWNER_ADMIN_ROLES = [
  USER_ROLES.SUPER_OWNER,
  USER_ROLES.BRANCH_OWNER,
  USER_ROLES.ADMIN,
]

const STAFF_OPERATION_ROLES = [
  USER_ROLES.CASHIER,
  USER_ROLES.TECHNICIAN,
  USER_ROLES.CASH_CUSTODIAN,
]

const BRANCH_OPERATION_ROLES = [
  ...OWNER_ADMIN_ROLES,
  USER_ROLES.CASHIER,
  USER_ROLES.TECHNICIAN,
]

const SALES_OPERATION_ROLES = [
  ...OWNER_ADMIN_ROLES,
  USER_ROLES.CASHIER,
  USER_ROLES.TECHNICIAN,
]

export const APP_MODULES = [
  // --- OPERATIONS & SALES ---
  {
    key: "pos",
    label: "POS Cashiering",
    group: "Operations",
    roles: SALES_OPERATION_ROLES,
  },
  {
    key: "quotations",
    label: "Quotations",
    group: "Operations",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "pc-builds",
    label: "Bundle Items (Packages)",
    group: "Operations",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "services",
    label: "Services / Job Orders",
    group: "Operations",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "warranty",
    label: "Warranty Claims",
    group: "Operations",
    roles: BRANCH_OPERATION_ROLES,
  },

  // --- INVENTORY & PURCHASING ---
  {
    key: "inventory",
    label: "Branch Inventory",
    group: "Inventory & Purchasing",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "serials",
    label: "Serial Monitoring",
    group: "Inventory & Purchasing",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "stock-transfers",
    label: "Stock Transfers",
    group: "Inventory & Purchasing",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "purchase-orders",
    label: "Purchase Orders",
    group: "Inventory & Purchasing",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "receivings",
    label: "Receiving / Deliveries",
    group: "Inventory & Purchasing",
    roles: OWNER_ADMIN_ROLES,
  },

  // --- FINANCE & CREDITS ---
  {
    key: "cash-box",
    label: "Cash Register & Vault",
    group: "Finance & Credits",
    roles: [USER_ROLES.SUPER_OWNER, USER_ROLES.BRANCH_OWNER, USER_ROLES.ADMIN],
  },
  {
    key: "credits",
    label: "Credit Accounts (AR)",
    group: "Finance & Credits",
    roles: [USER_ROLES.SUPER_OWNER, USER_ROLES.BRANCH_OWNER, USER_ROLES.ADMIN],
  },
  {
    key: "incentives",
    label: "Commission & Incentives",
    group: "Finance & Credits",
    roles: [USER_ROLES.SUPER_OWNER, USER_ROLES.BRANCH_OWNER, USER_ROLES.ADMIN],
  },

  // --- FILE MAINTENANCE ---
  {
    key: "items",
    label: "Item Catalog & Pricing",
    group: "File Maintenance",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "categories",
    label: "Categories Maintenance",
    group: "File Maintenance",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "customers",
    label: "Customer Directory",
    group: "File Maintenance",
    roles: BRANCH_OPERATION_ROLES,
  },
  {
    key: "suppliers",
    label: "Supplier Registry",
    group: "File Maintenance",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "services-maintenance",
    label: "Service Catalog Rules",
    group: "File Maintenance",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "employees",
    label: "Employees & Staff Hub",
    group: "File Maintenance",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "users",
    label: "Users & Staff Accounts",
    group: "File Maintenance",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "settings",
    label: "System Rules & Settings",
    group: "File Maintenance",
    roles: OWNER_ADMIN_ROLES,
  },

  // --- REPORTS & AUDIT ---
  {
    key: "reports",
    label: "Reports & Analytics",
    group: "Reports & Audit",
    roles: OWNER_ADMIN_ROLES,
  },
  {
    key: "alerts",
    label: "Action Alerts",
    group: "Reports & Audit",
    roles: Object.values(USER_ROLES),
  },
  {
    key: "audit-logs",
    label: "Activity Audit Logs",
    group: "Reports & Audit",
    roles: OWNER_ADMIN_ROLES,
  },
]

export function isUserSenior(user) {
  if (!user) return false
  const classification = String(user.incentiveClassification || "").toUpperCase()
  const role = String(user.role || "").toUpperCase()
  return (
    classification === "SENIOR_SALES_AGENT" ||
    classification === "SENIOR_TECHNICIAN" ||
    classification.startsWith("SENIOR_") ||
    role.startsWith("SENIOR_")
  )
}

export function canUserAccessPurchases(user) {
  if (!user) return false
  const role = typeof user === "string" ? user : user.role
  if (OWNER_ADMIN_ROLES.includes(role)) return true
  return isUserSenior(user)
}

export function getModulesForRole(role) {
  return APP_MODULES.filter((module) => module.roles.includes(role))
}

export function canRoleAccessModule(userOrRole, moduleKey) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role
  if (moduleKey === "purchase-orders" || moduleKey === "receivings") {
    return canUserAccessPurchases(userOrRole)
  }
  return APP_MODULES.some(
    (module) => module.key === moduleKey && module.roles.includes(role),
  )
}

export function getDefaultModuleForRole(role) {
  if (role === USER_ROLES.TECHNICIAN) return "services"
  return "pos"
}
