# POSynctify Frontend

React/Vite frontend for the POSynctify Cloud POS & Business Management System with Offline-First Auto-Sync, PayMongo QR Ph / E-Wallets, and OCR Quotation Parsing.

## Local commands

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

Set `VITE_API_BASE_URL` to the backend URL including `/api`. The variable is embedded at build time, so redeploy after changing it.

The project root is this directory. Build command: `npm run build`. Output directory: `dist`.
