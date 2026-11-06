import { useEffect, useState } from "react"
import {
  ArrowLeftRight,
  Award,
  Banknote,
  BarChart3,
  BellRing,
  Boxes,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  History,
  Layers,
  PackageCheck,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  Truck,
  UserCheck,
  UserCog,
  UsersRound,
  Wrench,
  X,
} from "lucide-react"

const ICONS = {
  pos: ShoppingCart,
  quotations: ClipboardList,
  "pc-builds": Boxes,
  services: Wrench,
  warranty: ShieldCheck,
  inventory: Boxes,
  serials: PackageSearch,
  "stock-transfers": ArrowLeftRight,
  "purchase-orders": FileSpreadsheet,
  receivings: PackageCheck,
  "cash-box": Banknote,
  credits: CreditCard,
  incentives: Award,
  items: Tags,
  categories: Layers,
  "services-maintenance": Layers,
  customers: UsersRound,
  employees: UserCheck,
  suppliers: Truck,
  users: UserCog,
  settings: SlidersHorizontal,
  reports: BarChart3,
  alerts: BellRing,
  "audit-logs": History,
}

const STORAGE_KEY = "pointify_sidebar_open_groups"

function Sidebar({
  activePage,
  modules,
  onChangePage,
  isCollapsed = false,
  onClose,
  className = "",
}) {
  const groups = modules.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const activeGroup = modules.find((item) => item.key === activePage)?.group

  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === "object") {
          return parsed
        }
      }
    } catch {
      // ignore storage errors
    }
    return {
      Operations: true,
      "Inventory & Purchasing": true,
      "Finance & Credits": false,
      "File Maintenance": false,
      "Reports & Audit": false,
      ...(activeGroup ? { [activeGroup]: true } : {}),
    }
  })

  // Ensure the group containing the active page is expanded when navigating
  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((prev) => {
        if (prev[activeGroup]) return prev
        const next = { ...prev, [activeGroup]: true }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    }
  }, [activeGroup])

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = prev[groupName] ?? true
      const next = {
        ...prev,
        [groupName]: !isCurrentlyOpen,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleChangePage = (pageKey) => {
    onChangePage(pageKey)
    if (onClose) onClose()
  }

  return (
    <aside
      className={`h-svh shrink-0 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-sidebar)] py-5 text-white ${isCollapsed ? "w-20 px-3" : "w-72 px-4"} ${className}`}
    >
      <div className="flex items-center gap-3 px-1">
        <img
          alt="Pointify Logo"
          className="size-11 shrink-0 rounded-2xl bg-white p-1 object-contain shadow-soft"
          src="/pointify-logo.png"
        />

        {!isCollapsed ? (
          <div className="min-w-0">
            <p className="brand-text text-base font-bold tracking-tight">Pointify</p>
            <p className="truncate text-xs text-white/60">Cloud POS & Management</p>
          </div>
        ) : null}

        {onClose ? (
          <button
            className="ml-auto grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <nav className="mt-7 space-y-4">
        {Object.entries(groups).map(([group, items]) => {
          const isOpen = isCollapsed ? true : (openGroups[group] ?? true)
          const hasActiveItem = items.some((item) => item.key === activePage)

          return (
            <div key={group}>
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className={`mb-1.5 flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.16em] transition cursor-pointer ${
                    hasActiveItem
                      ? "text-white/80 hover:bg-white/8 hover:text-white"
                      : "text-white/40 hover:bg-white/8 hover:text-white/75"
                  }`}
                >
                  <span className="truncate">{group}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isOpen && hasActiveItem ? (
                      <span className="size-1.5 rounded-full bg-[var(--color-maroon)]" />
                    ) : null}
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </div>
                </button>
              ) : null}

              {isOpen ? (
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = ICONS[item.key] || ShoppingCart
                    const isActive = activePage === item.key

                    return (
                      <button
                        className={`flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition cursor-pointer ${
                          isCollapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-[var(--color-maroon)] text-white shadow-soft"
                            : "text-white/72 hover:bg-white/10 hover:text-white"
                        }`}
                        key={item.key}
                        onClick={() => handleChangePage(item.key)}
                        title={item.label}
                        type="button"
                      >
                        <Icon className="size-4 shrink-0" />
                        {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
