# InvoiceFlow — Professional Invoice Generator

A modern, responsive invoice generation web app built for freelancers and service providers.

---

## Features

- **3 Professional Templates** — Minimal, Modern, Corporate
- **Export to PDF, PNG, JPEG** — High-resolution, print-ready output
- **Real-time Preview** — See changes instantly
- **Service Catalogue** — Pre-loaded with 7 freelance services; add unlimited more
- **Client Management** — Save and reuse client info
- **Freelancer Profile** — Logo, signature, branding, bank details
- **Smart Calculations** — Auto-calculates subtotal, discount, tax, and grand total
- **4 Currencies** — NGN, USD, GBP, EUR
- **Dark Mode** — Full dark/light theme support
- **Persistent State** — All data saved to localStorage; survives page refresh
- **Mobile Responsive** — Works on all screen sizes

---

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Framework   | Next.js 15 (App Router)  |
| Language    | TypeScript               |
| Styling     | Tailwind CSS             |
| Components  | Shadcn UI (Radix UI)     |
| State       | React Context + hooks    |
| Storage     | LocalStorage             |
| PDF Export  | jsPDF + html2canvas      |
| Toasts      | Sonner                   |

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd invoiceflow
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
invoiceflow/
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout + providers
    │   ├── page.tsx            # Main two-panel page
    │   ├── globals.css         # Global styles + CSS variables
    │   └── providers.tsx       # ThemeProvider + AppProvider + Toaster
    ├── components/
    │   ├── ui/                 # Shadcn-style base components
    │   ├── layout/
    │   │   └── Header.tsx      # App header with nav
    │   ├── invoice/
    │   │   ├── InvoiceEditor.tsx
    │   │   ├── LineItemsSection.tsx
    │   │   ├── TotalsSection.tsx
    │   │   └── NotesSection.tsx
    │   ├── preview/
    │   │   ├── InvoicePreview.tsx
    │   │   └── templates/
    │   │       ├── MinimalTemplate.tsx
    │   │       ├── ModernTemplate.tsx
    │   │       └── CorporateTemplate.tsx
    │   └── dialogs/
    │       ├── ProfileDialog.tsx
    │       ├── ClientDialog.tsx
    │       └── ServicesDialog.tsx
    ├── contexts/
    │   └── AppContext.tsx      # Global state provider
    ├── hooks/
    │   ├── useLocalStorage.ts
    │   ├── useProfile.ts
    │   ├── useClients.ts
    │   ├── useServices.ts
    │   └── useInvoice.ts
    ├── lib/
    │   ├── utils.ts            # cn() utility
    │   ├── storage.ts          # localStorage helpers
    │   ├── calculations.ts     # Invoice math
    │   ├── export.ts           # PDF/PNG/JPEG export
    │   ├── formatters.ts       # Currency/date formatting
    │   └── sample-data.ts      # Default services
    └── types/
        └── index.ts            # All TypeScript types
```

---

## Default Services

The app ships with 7 pre-loaded services:

| Service | Default Rate |
|---------|-------------|
| Data Analysis | ₦75,000 |
| Data Visualization | ₦60,000 |
| Power BI Dashboard | ₦150,000 |
| SQL Development | ₦80,000 |
| Excel Automation | ₦50,000 |
| Tutoring / Training | ₦25,000 |
| PowerPoint Design | ₦45,000 |

---

## Usage

### Creating an Invoice

1. Fill in **Invoice Details** (auto-generated number, dates, currency)
2. Add **Client Information** or select from saved clients
3. Add **Line Items** — select from catalogue or type custom services
4. Configure **Totals** — optional discount (% or fixed) and tax rate
5. Add **Notes** — payment instructions, terms, thank you message
6. Choose a **Template** (Minimal, Modern, Corporate)
7. **Export** as PDF, PNG, or JPEG

### Profile Setup

Click **Profile** in the header to set:
- Your name and business name
- Contact details
- Bank details (auto-populate payment instructions)
- Logo and digital signature
- Accent color for templates

---

## LocalStorage Keys

| Key | Description |
|-----|-------------|
| `invoiceflow_profile` | Freelancer profile |
| `invoiceflow_clients` | Saved clients |
| `invoiceflow_services` | Service catalogue |
| `invoiceflow_settings` | App settings (invoice counter, defaults) |
| `invoiceflow_invoices` | Saved invoices |
| `invoiceflow_current_invoice` | Current draft |

---

## Future Extensions (Supabase-Ready)

The architecture is designed for easy Supabase integration:

1. Replace `useLocalStorage` hooks with Supabase queries
2. Add auth with `@supabase/auth-helpers-nextjs`
3. Create database tables matching the TypeScript types in `src/types/index.ts`
4. Extend with: client portal, online payments, multi-user support

The `AppContext` interface remains stable — only the storage layer changes.

---

## Export Notes

- **PDF**: A4 format, multi-page support, print-ready
- **PNG**: 2× resolution, suitable for WhatsApp/email sharing
- **JPEG**: 0.95 quality, white background, smaller file size
- Exports capture the visible preview at 794px width (A4 equivalent)

---

## License

MIT
