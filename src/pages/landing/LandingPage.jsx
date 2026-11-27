import React, { useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Lock,
  Mail,
  QrCode,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Wrench,
  Zap,
} from "lucide-react"

export default function LandingPage({ onGoToLogin }) {
  const [copiedRole, setCopiedRole] = useState(null)

  const demoAccounts = [
    {
      role: "Super Owner",
      identifier: "Joshua Parungao",
      pass: "password123",
      desc: "Full administrative access across all branches, reports, settings, and audits.",
      badgeTone: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      role: "Cashier",
      identifier: "kyle.musngi",
      pass: "password123",
      desc: "POS register, sales checkout, PayMongo digital QR, and warranty receipts.",
      badgeTone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  ]

  const features = [
    {
      icon: RefreshCw,
      title: "Offline-First Engine (Auto-Sync)",
      desc: "Operates 100% offline via client-side IndexedDB caching. Cashiers can continue selling, creating customers, and issuing receipts during total network outages, automatically syncing to PostgreSQL when connection restores.",
      badge: "IndexedDB Outbox",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      icon: QrCode,
      title: "PayMongo QR Ph & Digital Wallets",
      desc: "Interoperable national QR Ph standard powered by PayMongo API. Accepts real-time payments from GCash, Maya, ShopeePay, credit cards, and online banking with automated settlement status verification.",
      badge: "Fintech Gateway",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      icon: Mail,
      title: "Automated Warranty E-Receipts",
      desc: "Instant client-side PDF document generation combined with transactional SMTP email delivery. Customers receive official branded warranty receipts with item serial numbers and warranty guidelines in their inbox.",
      badge: "Nodemailer SMTP",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      icon: Sparkles,
      title: "Smart OCR Quotation Parser",
      desc: "AI-assisted computer vision parser that reads printed or scanned supplier quotation documents, automatically parsing line items, quantities, and prices directly into active POS shopping carts.",
      badge: "Computer Vision",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      icon: Layers,
      title: "Multi-Branch Serial & RMA Tracking",
      desc: "Complete serial number lifecycle monitoring from Purchase Orders and supplier receivings to customer sale warranties and technical service repair claims across Branch 1 & Branch 2.",
      badge: "Hardware Lifecycle",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise RBAC & Non-Fiscal BIR",
      desc: "Strict role-based access control (Super Owner, Admin, Cashier, Technician) with immutable system audit trails and registered BIR-compliant non-fiscal warranty document templates.",
      badge: "Audit & Compliance",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ]

  const stack = [
    { name: "React 18 & Vite", category: "Frontend Framework", icon: Globe },
    { name: "Node.js & Express", category: "Backend Microservices", icon: Server },
    { name: "PostgreSQL & Prisma", category: "Database & ORM", icon: Database },
    { name: "IndexedDB API", category: "Offline Local Storage", icon: Cpu },
    { name: "Docker & Coolify", category: "Self-Hosted DevOps", icon: Layers },
    { name: "PayMongo SDK", category: "Payment Gateway", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
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
                v2.0 Cloud & Offline
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#architecture"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Architecture
            </a>
            <a
              href="#features"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Key Modules
            </a>
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
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-xs mb-6">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            Full-Stack Cloud POS & Business ERP System
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.12]">
            Offline-First Resiliency meets Modern{" "}
            <span className="bg-gradient-to-r from-[#1e60ff] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Omnichannel Fintech
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Engineered for high-volume computer parts retail and repair service centers. 
            Features instant <strong>IndexedDB outbox synchronization</strong>, <strong>PayMongo QR Ph payments</strong>, 
            <strong>automated warranty email dispatch</strong>, and <strong>AI OCR quotation reading</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e60ff] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 hover:shadow-blue-500/35 active:scale-98 cursor-pointer"
            >
              <span>Launch Live System Demo</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#demo-credentials"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-98"
            >
              <User size={16} className="text-blue-600" />
              <span>View Demo Credentials</span>
            </a>
          </div>

          {/* App Preview Mockup Box */}
          <div className="mt-14 mx-auto max-w-5xl rounded-3xl border border-slate-300 bg-white/90 p-2 shadow-2xl backdrop-blur-sm sm:p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-inner">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-rose-500/80" />
                  <span className="size-3 rounded-full bg-amber-500/80" />
                  <span className="size-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  posynctify.cloud &bull; POS Cashiering & Live Sync
                </span>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  Active Demo
                </span>
              </div>

              {/* Banner Graphic */}
              <div className="p-4 sm:p-8 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                <div className="space-y-3 max-w-lg">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={13} /> Zero Data Loss Offline Engine
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Uninterrupted POS Transactions Even Without Internet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Test the system by toggling your browser offline (or turning off WiFi). Add items to cart, enter custom customer details, and checkout. Everything is saved locally and safely queued for background synchronization!
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
                  <div className="rounded-xl border border-slate-800 bg-slate-850 p-3 text-xs text-slate-300 flex items-center justify-between gap-4">
                    <span>PayMongo Sandbox:</span>
                    <strong className="text-emerald-400 font-mono">LIVE / READY</strong>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-850 p-3 text-xs text-slate-300 flex items-center justify-between gap-4">
                    <span>Offline IndexedDB:</span>
                    <strong className="text-blue-400 font-mono">ACTIVE (v3)</strong>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-850 p-3 text-xs text-slate-300 flex items-center justify-between gap-4">
                    <span>Warranty E-Receipt SMTP:</span>
                    <strong className="text-purple-400 font-mono">GMAIL INTEGRATED</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section id="demo-credentials" className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Quick Portfolio Access</h2>
            <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Evaluator & Recruiter Demo Accounts
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Feel free to log in and test all operational features, cashiering, inventory transfers, and settings.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {demoAccounts.map((acc) => (
              <div
                key={acc.role}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-slate-900">{acc.role}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${acc.badgeTone}`}>
                      Preset Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">{acc.desc}</p>

                  <div className="rounded-xl bg-white p-3 border border-slate-200 text-xs font-mono space-y-1.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username/Email:</span>
                      <strong className="text-slate-900 select-all">{acc.identifier}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Password:</span>
                      <strong className="text-slate-900 select-all">{acc.pass}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold transition active:scale-98 cursor-pointer shadow-xs"
                >
                  <span>Log in as {acc.role}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Capabilities</h2>
            <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Architected for Performance & Reliability
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Every component was custom designed to solve critical operational bottlenecks in fast-paced retail.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`grid size-11 place-items-center rounded-xl border ${feat.color}`}>
                        <Icon size={20} />
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* System Architecture & Tech Stack */}
      <section id="architecture" className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">DevOps & Stack</h2>
            <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Production Architecture
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Containerized microservices running on a self-hosted Linux VPS orchestrating modern web standards.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {stack.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-600 shadow-xs border border-slate-200">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">{item.category}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Prominent Author / Full-Stack Developer Footer */}
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
                Cloud POS, Multi-Branch Inventory Monitoring, and Business Management System. Engineered for high-throughput retail operations with zero-compromise offline resilience.
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
                  <a href="#features" className="hover:text-white transition">
                    &bull; Core Modules
                  </a>
                </li>
                <li>
                  <a href="#demo-credentials" className="hover:text-white transition">
                    &bull; Preset Demo Logins
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Developer Col (HIGHLIGHTED!) */}
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
                Designed, developed, tested, and deployed end-to-end from database schema architecture and offline IndexedDB engine to Coolify Linux Docker production hosting.
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
