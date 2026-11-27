import React, { useState } from "react"
import {
  Activity,
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  CalendarClock,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Cpu,
  CreditCard,
  Database,
  DollarSign,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  Lock,
  Mail,
  Percent,
  QrCode,
  Receipt,
  RefreshCw,
  Server,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  User,
  UserCheck,
  Wrench,
  Zap,
} from "lucide-react"

export default function LandingPage({ onGoToLogin }) {
  const [activeTab, setActiveTab] = useState("retail") // 'retail' | 'service' | 'hybrid'
  const [copiedKey, setCopiedKey] = useState(null)

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const demoAccounts = [
    {
      role: "Super Owner (Full Access)",
      identifier: "Joshua Parungao",
      pass: "password123",
      desc: "Unrestricted administrative privileges: Six-Layer executive reports, AR aging, interest & markup rates, employee rules, audit logs, and branch settings.",
      badgeTone: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      role: "Cashier (Frontline Sales)",
      identifier: "kyle.musngi",
      pass: "password123",
      desc: "Speed-optimized POS register: Barcode scanning, PayMongo QR Ph generation, AR credit lookup, offline checkout, and warranty e-receipt dispatch.",
      badgeTone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  ]

  const coreModules = [
    {
      icon: Calculator,
      title: "Ledger Accounts & Dynamic Markups",
      category: "Accounting & Pricing",
      badge: "Real-Time Ledger",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      desc: "Complete double-entry customer and supplier ledger tracking debit/credit invoice entries, running balances, and auto-generated Statements of Account (SOA). Features dynamic cost markup calculation (Cost Price + Markup % = Base SRP) with live margin safeguards.",
      highlights: [
        "Running customer & supplier ledger balances",
        "Automated Cost vs Base SRP vs Markup % logic",
        "Exportable PDF/Excel Statement of Account (SOA)",
      ],
    },
    {
      icon: Percent,
      title: "Accounts Receivable (AR) & Flexible Interest",
      category: "Credit & Financing",
      badge: "Configurable % Yield",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      desc: "Flexible in-house and third-party credit financing (Home Credit, Salmon, Skyro, In-House Installments) across 3 to 24 month terms. Interest rate percentages are 100% customizable per term, with automated amortization schedules, collection receipts, and default warnings.",
      highlights: [
        "Configurable monthly/term interest percentage",
        "Multi-term options: Straight, 3, 6, 9, 12, 18, 24 mos",
        "Partial payments, collection receipts & default alerts",
      ],
    },
    {
      icon: BarChart3,
      title: "Nahimay na Financial Intelligence Suite",
      category: "Executive Analytics",
      badge: "Six-Layer Matrix",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      desc: "Deconstructs business health into fine-grained granular reports: Six-Layer Executive Profitability (Cost, Base Margin, Markup, Financing Interest, Net Profit), AR Aging Buckets (Current to 120+ days overdue), Product Profitability per SKU, and Cash vs AR settlement cashflows.",
      highlights: [
        "Six-Layer Profitability: COGS, Markup & Financing yield",
        "AR Aging breakdown (0-30, 31-60, 61-90, 91-120+ days)",
        "Daily Cash Box Drawer sessions (X and Z-Readings)",
      ],
    },
    {
      icon: UserCheck,
      title: "Employee Rules & Tiered Incentive Engine",
      category: "HR & Commission Rules",
      badge: "Versioned Rules",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      desc: "Comprehensive employee governance enforcing operational rules per role (Super Owner, Admin, Cashier, Technician). Includes strict cashier drawer limits, manager overrides for voids/refunds, and automated tiered incentive rules for sales staff and repair technician milestones.",
      highlights: [
        "Strict cashier rules: Manager approval for voids & refunds",
        "Configurable technician labor commission rules",
        "Shift logs, attendance audit & performance payouts",
      ],
    },
    {
      icon: RefreshCw,
      title: "Offline-First Engine (IndexedDB Outbox)",
      category: "High-Availability Architecture",
      badge: "Zero-Downtime",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      desc: "Ensures total operational continuity during internet disconnects. Caches product catalogs, active pricing, and customer records locally in browser IndexedDB. Transactions write to an offline outbox queue and automatically reconcile with PostgreSQL upon reconnection.",
      highlights: [
        "Local IndexedDB database caching with zero lag",
        "Optimistic checkout without server latency",
        "Conflict-safe background sync queue",
      ],
    },
    {
      icon: QrCode,
      title: "PayMongo QR Ph & Omnichannel Payments",
      category: "Fintech Integration",
      badge: "Real-Time Settlement",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      desc: "Full integration with the national QR Ph standard powered by PayMongo API. Generates dynamic scannable QR codes for GCash, Maya, ShopeePay, and bank apps, with support for cash drawer management, split tenders (Cash + QR), and AR credit lookup.",
      highlights: [
        "Dynamic customer-facing QR Ph codes",
        "Multi-tender split payments (Cash + QR + Card)",
        "Automated webhook status polling",
      ],
    },
    {
      icon: Mail,
      title: "Automated Warranty E-Receipts (Gmail SMTP)",
      category: "Customer Communication",
      badge: "Unrestricted Delivery",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      desc: "Instant client-side PDF document compiler coupled with server-side transactional Gmail SMTP. Automatically dispatches branded non-fiscal warranty receipts with individual serial numbers, store terms, and digital claim slips directly to customer inboxes.",
      highlights: [
        "Deliverable to any global email domain without sandbox blocks",
        "Embedded item serial numbers & RMA duration",
        "Downloadable official PDF attachment",
      ],
    },
    {
      icon: Sparkles,
      title: "Smart OCR Quotation-to-Cart Parser",
      category: "Computer Vision",
      badge: "AI Automation",
      badgeColor: "bg-pink-100 text-pink-800 border-pink-200",
      desc: "Transforms physical and digital supplier estimates into active POS transactions. Upload a printed quotation or invoice snapshot, and the OCR parser extracts matching product titles, quantities, and pricing straight into the cashier cart.",
      highlights: [
        "Instant document-to-cart conversion",
        "Eliminates manual cashier re-entry errors",
        "Live fuzzy matching against inventory SKUs",
      ],
    },
    {
      icon: Layers,
      title: "Multi-Branch Serial & Hardware Lifecycle",
      category: "Inventory & Supply Chain",
      badge: "Unit Traceability",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      desc: "Complete end-to-end unit tracking across branches. Records item serial numbers during Purchase Order receiving, monitors stock transfers between warehouses, locks serials during sale, and tracks warranty claims for supplier replacement.",
      highlights: [
        "Unique serial lifecycle from PO to Sale",
        "Inter-branch stock transfer manifests",
        "Low stock threshold alerts & automated reorder levels",
      ],
    },
  ]

  const businessTypes = [
    {
      id: "retail",
      label: "Without Services (Pure Retail & Wholesale)",
      shortTitle: "Pure Retail & Wholesale",
      icon: Store,
      tagline: "High-speed checkout, customer AR credit ledger, and dynamic cost markups",
      description:
        "Engineered for businesses focused entirely on merchandise, where fast barcode scanning, customer credit limits, volume pricing tiers, and supplier purchasing govern daily revenue.",
      idealFor: [
        "Computer Parts & Electronics Retail",
        "Hardware & Construction Supplies",
        "Convenience Stores & Groceries",
        "Boutiques, Footwear & Apparel",
        "Wholesale Distributors & General Merchandise",
      ],
      features: [
        {
          title: "Customer Ledger & AR Credit Accounts",
          desc: "Set customer credit limits, track unpaid invoices, generate Statement of Accounts (SOA), and accept partial installment payments.",
        },
        {
          title: "Dynamic Markups & Wholesale Tier Pricing",
          desc: "Configure profit markup percentages over supplier cost price, with automatic unit conversions (boxes, packs, and individual pieces).",
        },
        {
          title: "Strict Cashier Rules & Cash Drawer Audits",
          desc: "Employee rules mandate manager passcodes for voids/refunds; tracks cash drawer opening floats and daily X/Z readings.",
        },
        {
          title: "Procurement & Multi-Branch Stock Transfers",
          desc: "Manage Purchase Orders, supplier receivings with serial tagging, and inter-branch warehouse transfer manifests.",
        },
      ],
    },
    {
      id: "service",
      label: "With Services & Repairs (Job Orders)",
      shortTitle: "Repair & Service Centers",
      icon: Wrench,
      tagline: "End-to-end technical job orders, milestone tracking, and technician incentives",
      description:
        "Engineered for service-driven shops that intake customer equipment, diagnose faults, bill replacement parts, and reward technicians via structured commission rules.",
      idealFor: [
        "IT & Laptop Repair Shops",
        "Mobile Phone & Tablet Service Centers",
        "Motorcycle & Automotive Repair Garages",
        "Electronics & Appliance Repair Labs",
        "Custom Rig & PC Building Studios",
      ],
      features: [
        {
          title: "Diagnostic Intake & Claim Slips",
          desc: "Record customer device serial, physical scratches/dents, symptoms, and accessories with printed job order claim stubs.",
        },
        {
          title: "Milestone Stage Progression Pipeline",
          desc: "Live status updates: Received → Diagnosis → In Repair → Quality Testing → Ready for Customer Pickup.",
        },
        {
          title: "Technician Incentive & Commission Rules",
          desc: "Configure automated employee labor commissions and performance incentives per completed service job order.",
        },
        {
          title: "Live Inventory Parts Billing",
          desc: "Pull replacement spare parts directly from the warehouse inventory catalog straight into the service repair invoice.",
        },
      ],
    },
    {
      id: "hybrid",
      label: "Hybrid (Retail + Service Center)",
      shortTitle: "Hybrid Enterprises",
      icon: Boxes,
      tagline: "The complete ecosystem: sell merchandise over the counter while servicing equipment",
      description:
        "The ultimate architecture for modern businesses doing both: retailing parts from the sales counter while operating a busy repair, assembly, and maintenance bench in the back.",
      idealFor: [
        "PC Hubs (Parts Retail + Custom PC Assembly & Board Repair)",
        "Bicycle & E-Scooter Shops (Accessories + Tuning & Tune-up Labor)",
        "Mobile Phone Outlets (Gadget Sales + Screen/Battery Replacement)",
        "Security Systems (CCTV & Alarm Hardware Sales + Installation Services)",
      ],
      features: [
        {
          title: "Unified Billing (Parts + Labor)",
          desc: "Combine over-the-counter retail items and service repair labor on a single customer invoice and payment transaction.",
        },
        {
          title: "Consolidated Six-Layer Profit Matrix",
          desc: "Nahimay na executive breakdown comparing retail product profit margins against service technician labor revenue.",
        },
        {
          title: "Flexible Financing on Goods & Repairs",
          desc: "Customers can finance high-ticket purchases (e.g. laptop + repair) on installment terms with custom interest rates.",
        },
        {
          title: "Unified Employee Role Governance",
          desc: "Frontline cashiers handle settlements and AR collections while technicians focus strictly on diagnostic job orders.",
        },
      ],
    },
  ]

  const selectedBusiness = businessTypes.find((b) => b.id === activeTab) || businessTypes[0]

  const stack = [
    { name: "React 19 & Vite", role: "Fast Reactive Frontend SPA", icon: Globe },
    { name: "Node.js & Express", role: "Modular Backend REST APIs", icon: Server },
    { name: "PostgreSQL & Prisma", role: "Relational Schema & Migrations", icon: Database },
    { name: "IndexedDB API", role: "Offline-First Local Storage Engine", icon: Cpu },
    { name: "Docker & Coolify", role: "Containerized VPS DevOps Hosting", icon: Layers },
    { name: "PayMongo SDK", role: "National QR Ph Payment Settlement", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              alt="POSynctify Logo"
              className="size-9 rounded-xl object-contain shadow-xs bg-white p-0.5"
              src="/icon.jpg"
            />
            <div>
              <span className="text-base font-black tracking-tight text-slate-950">
                POS<span className="text-[#1e60ff]">ynctify</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                Cloud & Offline v2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
              <a href="#flexibility" className="hover:text-blue-600 transition">
                Business Flexibility
              </a>
              <a href="#core-modules" className="hover:text-blue-600 transition">
                Core Capabilities
              </a>
              <a href="#demo-logins" className="hover:text-blue-600 transition">
                Live Demo Logins
              </a>
              <a href="#architecture" className="hover:text-blue-600 transition">
                DevOps Architecture
              </a>
            </nav>

            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e60ff] px-4 py-2 text-xs font-bold text-white shadow-soft transition hover:bg-blue-700 active:scale-98 cursor-pointer"
            >
              <span>Launch POS Demo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[680px] rounded-full bg-gradient-to-tr from-blue-400/20 via-indigo-400/15 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-xs mb-6">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            Full-Stack POS & Enterprise Management Platform
          </div>

          {/* Hero Heading */}
          <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.12]">
            Adaptive Enterprise POS & ERP for{" "}
            <span className="bg-gradient-to-r from-[#1e60ff] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Retail, Wholesale & Services
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Architected to adapt to <strong>any business structure</strong> — from high-turnover retail shops to technical service repair benches. Features a <strong>Customer AR Ledger</strong>, <strong>configurable financing interest rates</strong>, <strong>granular Six-Layer financial reports</strong>, and <strong>strict employee rule governance</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e60ff] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 hover:shadow-blue-500/35 active:scale-98 cursor-pointer"
            >
              <span>Explore Live System</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#flexibility"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-98"
            >
              <SlidersHorizontal size={16} className="text-blue-600" />
              <span>See How It Adapts</span>
            </a>
          </div>

          {/* Quick Stats Metric Bar */}
          <div className="mt-12 mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Suite</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">6-Layer Matrix</p>
              <p className="text-[11px] text-slate-500">Nahimay na profit & AR aging</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credit Financing</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">Custom % Interest</p>
              <p className="text-[11px] text-slate-500">In-House, HomeCredit, Salmon</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Governance</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">Employee Rules</p>
              <p className="text-[11px] text-slate-500">Role controls & labor incentives</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offline Resilience</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">100% Zero-Loss</p>
              <p className="text-[11px] text-slate-500">IndexedDB background auto-sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Extreme Business Flexibility (With or Without Services) */}
      <section id="flexibility" className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 mb-3">
              <SlidersHorizontal size={13} />
              Universal Business Architecture
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
              One Engine: With Services or Without Services
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standard POS platforms are built either strictly for supermarkets or strictly for repair shops. POSynctify bridges both worlds with customizable modules you can toggle to match your exact business model.
            </p>
          </div>

          {/* Interactive Model Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {businessTypes.map((b) => {
              const Icon = b.icon
              const isSelected = activeTab === b.id
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveTab(b.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-950 text-white shadow-md shadow-slate-900/10 scale-102"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  <Icon size={16} className={isSelected ? "text-blue-400" : "text-slate-500"} />
                  <span>{b.shortTitle}</span>
                </button>
              )
            })}
          </div>

          {/* Active Model Deep Dive Box */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {selectedBusiness.label}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  {selectedBusiness.tagline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedBusiness.description}
                </p>
              </div>

              {/* Ideal For Badges */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shrink-0 w-full lg:w-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Ideal Industry Fit:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBusiness.idealFor.map((ind) => (
                    <span
                      key={ind}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Cards for the chosen model */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {selectedBusiness.features.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="size-2 rounded-full bg-blue-600 mb-3" />
                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{feat.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: In-Depth Core Modules */}
      <section id="core-modules" className="border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Technical Depth</h2>
            <p className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
              Core Architecture & Enterprise Modules
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Meticulously engineered from schema design to front-end execution to handle complex accounting, credit terms, multi-branch inventory, and employee incentives.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreModules.map((mod) => {
              const Icon = mod.icon
              return (
                <div
                  key={mod.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                        <Icon size={22} />
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {mod.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 mb-2.5">{mod.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-5">{mod.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-1.5">
                    {mod.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION: Evaluator & Recruiter Demo Credentials */}
      <section id="demo-logins" className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Instant Access</h2>
            <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Evaluator & Recruiter Demo Credentials
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Test the live production deployment directly with preconfigured roles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {demoAccounts.map((acc, idx) => (
              <div
                key={acc.role}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-slate-950">{acc.role}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${acc.badgeTone}`}>
                      Preset Role
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">{acc.desc}</p>

                  <div className="rounded-2xl bg-white p-4 border border-slate-200 text-xs font-mono space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Username/Email:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{acc.identifier}</strong>
                        <button
                          onClick={() => copyToClipboard(acc.identifier, `user-${idx}`)}
                          className="text-slate-400 hover:text-blue-600 transition p-1"
                          title="Copy Username"
                        >
                          {copiedKey === `user-${idx}` ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Password:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{acc.pass}</strong>
                        <button
                          onClick={() => copyToClipboard(acc.pass, `pass-${idx}`)}
                          className="text-slate-400 hover:text-blue-600 transition p-1"
                          title="Copy Password"
                        >
                          {copiedKey === `pass-${idx}` ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white py-3 text-xs font-bold transition active:scale-98 cursor-pointer shadow-xs"
                >
                  <span>Log in as {acc.role.split(" ")[0]}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: DevOps & Production Architecture */}
      <section id="architecture" className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">DevOps & Stack</h2>
            <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Full-Stack Infrastructure
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Modern containerized cloud microservices orchestrating fast reactive clients with hardened relational storage.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {stack.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">{item.role}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION: Prominent Full-Stack Developer & DevOps Engineer Footer */}
      <footer className="border-t border-slate-200 bg-slate-950 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
            {/* Left Brand Col */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  alt="POSynctify Logo"
                  className="size-8 rounded-xl object-contain bg-white p-0.5"
                  src="/icon.jpg"
                />
                <span className="text-lg font-black tracking-tight text-white">
                  POS<span className="text-[#1e60ff]">ynctify</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Next-generation cloud POS and business ERP engineered for high adaptability across retail, wholesale, and repair service centers. Zero downtime with native offline data sync, customer ledger, customizable interest financing, and fine-grained financial reporting.
              </p>
            </div>

            {/* Middle Quick Links */}
            <div className="md:col-span-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li>
                  <button onClick={onGoToLogin} className="hover:text-white transition cursor-pointer">
                    &bull; Launch POS Cashiering
                  </button>
                </li>
                <li>
                  <a href="#flexibility" className="hover:text-white transition">
                    &bull; Business Flexibility
                  </a>
                </li>
                <li>
                  <a href="#core-modules" className="hover:text-white transition">
                    &bull; Core Capabilities
                  </a>
                </li>
                <li>
                  <a href="#demo-logins" className="hover:text-white transition">
                    &bull; Demo Credentials
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Developer Col */}
            <div className="md:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Solo Architecture & Deployment
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Joshua Parungao</h4>
                <p className="text-xs font-semibold text-blue-400">
                  Lead Full-Stack Developer & DevOps Engineer
                </p>
              </div>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                Architected, designed, engineered, and deployed end-to-end — spanning PostgreSQL database modeling, customer ledger & AR interest engine, offline-first IndexedDB synchronization, RESTful API design, PayMongo QR Ph integration, and automated Linux VPS container deployment via Coolify & Docker.
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <a
                  href="https://github.com/JoshuaParungao"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-slate-300 hover:text-white transition"
                >
                  <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub (@JoshuaParungao)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} POSynctify. All rights reserved.</p>
            <p className="text-[11px]">
              Engineered with React &bull; Node.js &bull; PostgreSQL &bull; Docker &bull; Coolify
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
