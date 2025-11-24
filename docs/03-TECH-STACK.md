# EVW Cloud ERP - Technology Stack & Justifications

## Stack Selection Philosophy

Our technology choices are guided by:
1. **Developer Experience**: Fast development cycles, great tooling
2. **Performance**: Fast load times, responsive UI
3. **Scalability**: Can grow from single-tenant to multi-tenant SaaS
4. **Cost-Effectiveness**: Minimize infrastructure costs initially
5. **Type Safety**: Prevent bugs with TypeScript
6. **Modern Best Practices**: Use current, well-supported technologies
7. **Pakistan Context**: Works well with Pakistani internet infrastructure

## Complete Tech Stack Overview

```
Frontend:     React 19 + TypeScript + Vite + TailwindCSS
Backend:      Supabase (PostgreSQL + Auth + Storage + Edge Functions)
State:        Zustand + React Query
Forms:        React Hook Form + Zod
UI Library:   shadcn/ui + Radix UI primitives
Charts:       Recharts
Icons:        Lucide React
PDF:          jsPDF / React-PDF
Barcode:      jsbarcode + react-qr-code
API:          RESTful + Supabase Realtime (WebSocket)
Auth:         Supabase Auth (JWT + Row Level Security)
File Storage: Supabase Storage (S3-compatible)
Caching:      Redis (Upstash for serverless)
Deployment:   Vercel (Frontend) + Supabase Cloud (Backend)
CI/CD:        GitHub Actions
Monitoring:   Sentry + PostHog
Testing:      Vitest + React Testing Library + Playwright
```

---

## Frontend Stack

### 1. React 19 (Latest)

**Why React?**
- ✅ **Industry Standard**: Most popular UI library with huge ecosystem
- ✅ **Performance**: Virtual DOM, concurrent rendering, server components
- ✅ **Component Reusability**: Build once, use everywhere
- ✅ **Rich Ecosystem**: Thousands of libraries and tools
- ✅ **Team Skills**: Easy to find developers who know React
- ✅ **Future-Proof**: React 19 includes all latest features (Server Components, Actions, etc.)

**React 19 New Features We'll Use:**
- `use()` hook for async data fetching
- Server Actions (when needed)
- Improved hydration errors
- Better form handling

**Alternatives Considered:**
- Vue.js: Good but smaller ecosystem
- Angular: Too heavy for this project
- Svelte: Great but less mature ecosystem

---

### 2. TypeScript 5.8.2

**Why TypeScript?**
- ✅ **Type Safety**: Catch bugs at compile time, not runtime
- ✅ **Better IDE Support**: Autocomplete, refactoring, inline docs
- ✅ **Self-Documenting**: Types serve as inline documentation
- ✅ **Easier Refactoring**: Confidence when changing code
- ✅ **Team Collaboration**: Clear interfaces between modules
- ✅ **Production Ready**: Reduces runtime errors by ~15-20%

**Example Benefit:**
```typescript
// Without TypeScript - easy to make mistakes
function createInvoice(customer, items) {
  // What properties does customer have?
  // What's in items array?
  // Runtime errors waiting to happen
}

// With TypeScript - clear and safe
function createInvoice(customer: Customer, items: CartItem[]): Invoice {
  // IDE knows exactly what's available
  // Type errors caught before running code
}
```

**Alternatives Considered:**
- JavaScript: No type safety, more runtime bugs
- Flow: Less popular, dying ecosystem

---

### 3. Vite 6.2.0

**Why Vite?**
- ✅ **Lightning Fast**: Hot Module Replacement (HMR) in <100ms
- ✅ **Modern**: Uses native ES modules, no bundling in dev
- ✅ **Fast Builds**: 10x faster than Webpack for production builds
- ✅ **Simple Config**: Minimal configuration needed
- ✅ **Plugin Ecosystem**: Great plugins available
- ✅ **Perfect for React**: Official React plugin with Fast Refresh

**Performance Comparison:**
```
Development Server Start:
- Webpack: 15-30 seconds
- Vite: 1-2 seconds

Hot Module Replacement:
- Webpack: 1-3 seconds
- Vite: 50-200ms

Production Build:
- Webpack: 3-5 minutes
- Vite: 30-60 seconds
```

**Alternatives Considered:**
- Create React App (CRA): Deprecated, slow
- Webpack: Slower, complex config
- Parcel: Good but less ecosystem

---

### 4. TailwindCSS

**Why TailwindCSS?**
- ✅ **Utility-First**: Rapid UI development
- ✅ **Consistent Design**: Predefined spacing, colors, sizes
- ✅ **No CSS Bloat**: Purges unused styles in production
- ✅ **Responsive**: Mobile-first, easy breakpoints
- ✅ **Customizable**: Easy to match EVW brand colors
- ✅ **Developer Experience**: Great IntelliSense, fast prototyping
- ✅ **Maintenance**: No CSS file to maintain, styles in component

**Example:**
```tsx
// Traditional CSS approach:
<div className="invoice-header">
  <h1 className="invoice-title">Invoice</h1>
</div>
// Requires separate CSS file, naming conventions, specificity battles

// TailwindCSS approach:
<div className="flex justify-between items-center px-6 py-4 bg-blue-600">
  <h1 className="text-2xl font-bold text-white">Invoice</h1>
</div>
// Everything visible, fast to write, consistent, responsive
```

**Production Bundle:**
- Development: Full Tailwind (~3MB)
- Production: Only used classes (~10-20KB after purge)

**Alternatives Considered:**
- CSS Modules: More boilerplate
- Styled Components: Runtime overhead
- Bootstrap: Too opinionated, harder to customize

---

### 5. shadcn/ui + Radix UI

**Why shadcn/ui?**
- ✅ **Copy-Paste Components**: You own the code, not a dependency
- ✅ **Fully Customizable**: Modify any component as needed
- ✅ **Accessible**: Built on Radix UI primitives (WAI-ARIA compliant)
- ✅ **Beautiful**: Modern, professional design out of the box
- ✅ **TypeScript**: Full type safety
- ✅ **TailwindCSS**: Styled with Tailwind, easy to customize
- ✅ **Production Ready**: Used by Vercel, Linear, and many others

**Components We'll Use:**
- Dialog/Modal for forms
- Dropdown menus for actions
- Tables for data display
- Forms with validation
- Toasts for notifications
- Select dropdowns
- Tabs for navigation
- Popover for contextual actions
- Command palette for quick actions

**Why Not a Full UI Library?**
- Material-UI: Heavy bundle size, hard to customize
- Ant Design: Too opinionated, Chinese design language
- Chakra UI: Good but adds dependency overhead

---

### 6. Recharts

**Why Recharts?**
- ✅ **React Native**: Built for React, declarative API
- ✅ **Responsive**: Auto-adapts to container size
- ✅ **Customizable**: Easy to match EVW brand colors
- ✅ **Good Performance**: Handles thousands of data points
- ✅ **Beautiful**: Professional-looking charts out of the box
- ✅ **Types**: Full TypeScript support

**Charts We'll Use:**
- Line Chart: Sales trends over time
- Bar Chart: Revenue by product category
- Pie Chart: Sales distribution by category
- Area Chart: Profit trends
- Composed Chart: Revenue vs Profit comparison

**Alternatives Considered:**
- Chart.js: Not React-native, requires wrapper
- D3.js: Too low-level, steep learning curve
- Victory: Similar but heavier bundle

---

### 7. Zustand (State Management)

**Why Zustand?**
- ✅ **Simple**: Minimal boilerplate, easy to learn
- ✅ **Tiny Bundle**: 1KB gzipped vs Redux (5KB)
- ✅ **Fast**: No unnecessary re-renders
- ✅ **No Context Provider**: Use anywhere, no wrapping
- ✅ **DevTools**: Redux DevTools integration
- ✅ **TypeScript**: Excellent type inference

**What We'll Store:**
- Current user and auth state
- UI state (sidebar open/closed, theme, etc.)
- Current cart items (for invoicing)
- App-wide notifications

**Example:**
```typescript
// Define store
import { create } from 'zustand'

interface CartStore {
  items: CartItem[]
  addItem: (item: Product) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  clearCart: () => set({ items: [] }),
}))

// Use in component
function Cart() {
  const { items, addItem, clearCart } = useCartStore()
  // ...
}
```

**Alternatives Considered:**
- Redux: Too much boilerplate
- MobX: More magic, harder to debug
- Jotai/Recoil: Atomic state, more complex

---

### 8. React Query (TanStack Query)

**Why React Query?**
- ✅ **Server State Management**: Perfect for API data
- ✅ **Automatic Caching**: Reduces API calls
- ✅ **Background Refetching**: Always fresh data
- ✅ **Optimistic Updates**: Instant UI feedback
- ✅ **Error Handling**: Built-in retry logic
- ✅ **DevTools**: Inspect cache, queries, mutations
- ✅ **TypeScript**: Full type safety

**What We'll Use It For:**
- Fetching products, customers, invoices
- Caching frequently accessed data
- Infinite scrolling for long lists
- Real-time data synchronization
- Optimistic invoice creation

**Example:**
```typescript
// Fetch products with caching
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Use in component
function ProductList() {
  const { data: products, isLoading, error } = useProducts()

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />

  return <div>{products.map(p => <ProductCard key={p.id} {...p} />)}</div>
}
```

**Alternatives Considered:**
- SWR: Similar but less features
- Apollo Client: Only for GraphQL
- Raw fetch: No caching, more boilerplate

---

### 9. React Hook Form + Zod

**Why React Hook Form?**
- ✅ **Performance**: Minimal re-renders
- ✅ **Small Bundle**: 9KB gzipped
- ✅ **Easy Validation**: Integrates with Zod
- ✅ **DevTools**: Form state inspector
- ✅ **Flexible**: Works with any UI library

**Why Zod?**
- ✅ **TypeScript-First**: Infer types from schemas
- ✅ **Runtime Validation**: Catch bad data from API
- ✅ **Composable**: Reuse schemas
- ✅ **Great Errors**: Clear validation messages

**Example:**
```typescript
// Define validation schema
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  sku: z.string().regex(/^[A-Z0-9-]+$/, 'Invalid SKU format'),
  costPrice: z.number().positive('Price must be positive'),
  retailPrice: z.number().positive(),
  stock: z.number().int().nonnegative(),
})

type ProductFormData = z.infer<typeof productSchema>

// Use in component
function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  })

  const onSubmit = async (data: ProductFormData) => {
    // TypeScript knows exact shape of data
    await createProduct(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... */}
    </form>
  )
}
```

**Alternatives Considered:**
- Formik: Slower, more re-renders
- Final Form: Less popular
- Yup (validation): No type inference

---

## Backend Stack

### 10. Supabase (Backend-as-a-Service)

**Why Supabase?**
- ✅ **PostgreSQL**: Industry-standard, powerful database
- ✅ **Built-in Auth**: Email, OAuth, JWT tokens, RLS
- ✅ **Real-time**: WebSocket subscriptions out of the box
- ✅ **Storage**: S3-compatible file storage
- ✅ **Edge Functions**: Serverless API endpoints (Deno)
- ✅ **Auto API**: Instant REST API from database schema
- ✅ **Row Level Security**: Database-level access control
- ✅ **Free Tier**: 500MB database, 1GB storage, 2GB bandwidth
- ✅ **Easy Scaling**: Upgrade as you grow
- ✅ **Local Development**: Full local development with Docker

**Supabase vs Building Custom Backend:**
```
Custom Backend (Node.js + Express):
- Setup time: 2-3 weeks
- Auth implementation: 1 week
- File storage setup: 3-4 days
- WebSocket setup: 3-4 days
- Security hardening: 1 week
- Total: 4-5 weeks

Supabase:
- Setup time: 1 day
- Auth: Built-in
- File storage: Built-in
- Real-time: Built-in
- Security: RLS built-in
- Total: 1-2 days
```

**Cost Comparison (Monthly):**
```
AWS (DIY Backend):
- EC2 (t3.medium): $30
- RDS PostgreSQL (db.t3.medium): $50
- S3 Storage: $10
- Load Balancer: $18
- Total: ~$108/month + DevOps time

Supabase Pro:
- Database, Auth, Storage, Real-time: $25/month
- Savings: $83/month + DevOps time
```

**Row Level Security Example:**
```sql
-- Only users can see their own data
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );
```

**Alternatives Considered:**
- Firebase: NoSQL (we need relational), more expensive
- AWS Amplify: More complex, steeper learning curve
- Custom Node.js Backend: More time, more maintenance
- Hasura: Good but only GraphQL (we want REST)

---

### 11. PostgreSQL 15+

**Why PostgreSQL?**
- ✅ **Relational**: Perfect for ERP (products, invoices, customers)
- ✅ **ACID Compliance**: Data integrity guaranteed
- ✅ **Rich Features**: JSON, full-text search, geospatial
- ✅ **Performance**: Handles millions of rows efficiently
- ✅ **Open Source**: No licensing costs
- ✅ **Mature**: 30+ years of development
- ✅ **Extensions**: PostGIS, pg_trgm, uuid-ossp, etc.

**Why Not NoSQL?**
- MongoDB: Relationships are complex in ERP systems
- DynamoDB: Expensive, hard to query flexibly
- Cassandra: Overkill for this scale

**PostgreSQL Features We'll Use:**
- **JSONB columns**: For flexible data (tags, settings, metadata)
- **Full-text search**: Product search
- **Triggers**: Auto-update stock, balances
- **Views**: Reporting queries
- **Indexes**: Fast lookups on SKU, invoice number, etc.
- **Foreign Keys**: Data integrity
- **Check Constraints**: Validate data at database level

---

### 12. Supabase Edge Functions (Deno Runtime)

**Why Edge Functions?**
- ✅ **Serverless**: No server management
- ✅ **Auto-Scaling**: Handles traffic spikes
- ✅ **TypeScript**: Same language as frontend
- ✅ **Fast Cold Starts**: <100ms
- ✅ **Global Edge Network**: Low latency worldwide
- ✅ **Cost-Effective**: Pay per invocation

**What We'll Use Edge Functions For:**
- PDF invoice generation (complex logic)
- WhatsApp message sending
- Scheduled reports (daily sales summary)
- Webhook handlers (payment gateways)
- Complex calculations (profit analytics)
- Data exports (CSV, Excel)

**Example Edge Function:**
```typescript
// supabase/functions/generate-invoice-pdf/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { invoiceId } = await req.json()

  // Fetch invoice data
  const supabase = createClient(...)
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, invoice_items(*), customers(*)')
    .eq('id', invoiceId)
    .single()

  // Generate PDF
  const pdfBuffer = await generatePDF(invoice)

  // Upload to storage
  await supabase.storage
    .from('invoices')
    .upload(`${invoiceId}.pdf`, pdfBuffer)

  return new Response(JSON.stringify({ success: true }))
})
```

**Alternatives Considered:**
- AWS Lambda: More setup, cold starts
- Vercel Serverless Functions: Good but tied to Vercel
- Cloudflare Workers: Different API, steeper learning curve

---

### 13. Redis (Upstash for Serverless)

**Why Redis?**
- ✅ **Caching**: Speed up frequent queries
- ✅ **Session Storage**: Fast user sessions
- ✅ **Rate Limiting**: Prevent abuse
- ✅ **Real-time Features**: Pub/sub for notifications

**Why Upstash?**
- ✅ **Serverless**: Pay per request, not uptime
- ✅ **Global**: Low latency worldwide
- ✅ **Free Tier**: 10,000 requests/day
- ✅ **REST API**: No connection pooling issues

**What We'll Cache:**
- Dashboard statistics (refresh every 5 minutes)
- Product lists (refresh on changes)
- User permissions (refresh on login)
- Low-stock products (refresh every hour)

**Example:**
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Cache dashboard stats
async function getDashboardStats() {
  // Try cache first
  const cached = await redis.get('dashboard:stats')
  if (cached) return cached

  // Cache miss - fetch from database
  const stats = await fetchStatsFromDB()

  // Cache for 5 minutes
  await redis.setex('dashboard:stats', 300, stats)

  return stats
}
```

**Cost:**
- Free tier: 10,000 commands/day
- Pro: $0.20 per 100K commands
- Very affordable for caching

**Alternatives Considered:**
- Redis Cloud: More expensive
- Memcached: Less features, no persistence
- No caching: Slower, more database load

---

## Development Tools

### 14. Vitest (Testing)

**Why Vitest?**
- ✅ **Vite-Native**: Same config as Vite
- ✅ **Fast**: Instant test runs
- ✅ **Jest-Compatible**: Same API as Jest
- ✅ **TypeScript**: Native TS support
- ✅ **Watch Mode**: Re-run on changes

**What We'll Test:**
- Utility functions (calculations, formatting)
- Hooks (useInvoice, useProduct)
- Store logic (Zustand stores)
- API integration (Supabase calls)

---

### 15. Playwright (E2E Testing)

**Why Playwright?**
- ✅ **Cross-Browser**: Chrome, Firefox, Safari
- ✅ **Fast**: Parallel test execution
- ✅ **Reliable**: Auto-wait, no flaky tests
- ✅ **Screenshots**: Debug failures visually
- ✅ **Video Recording**: See what happened

**What We'll Test:**
- Critical user flows (create invoice, add product)
- Authentication (login, logout, permissions)
- Payment flows
- Report generation

---

### 16. ESLint + Prettier

**Why ESLint?**
- ✅ **Code Quality**: Catch bugs, enforce patterns
- ✅ **Consistency**: Team code looks the same
- ✅ **TypeScript**: Typed linting rules

**Why Prettier?**
- ✅ **Formatting**: Auto-format on save
- ✅ **No Debates**: Opinionated formatting
- ✅ **Integration**: Works with ESLint

---

## Deployment & Infrastructure

### 17. Vercel (Frontend Hosting)

**Why Vercel?**
- ✅ **Zero Config**: Deploy with `git push`
- ✅ **Global CDN**: Fast worldwide
- ✅ **Edge Network**: <100ms latency
- ✅ **Preview Deployments**: Every PR gets a URL
- ✅ **Analytics**: Core Web Vitals tracking
- ✅ **Free Tier**: Hobby projects free

**Features:**
- Automatic HTTPS
- Custom domains
- Environment variables
- Rollback to previous deployments
- Team collaboration

**Cost:**
- Free: 100GB bandwidth, unlimited sites
- Pro: $20/month, 1TB bandwidth, team features

**Alternatives Considered:**
- Netlify: Similar but less optimized for React
- AWS S3 + CloudFront: More setup, more cost
- DigitalOcean: Need to manage servers

---

### 18. GitHub Actions (CI/CD)

**Why GitHub Actions?**
- ✅ **Integrated**: Built into GitHub
- ✅ **Free**: 2,000 minutes/month for private repos
- ✅ **Flexible**: Run any workflow
- ✅ **Matrix Builds**: Test multiple configs

**Our CI/CD Pipeline:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: vercel deploy --prod
```

**Alternatives Considered:**
- GitLab CI: Would need to migrate from GitHub
- CircleCI: Extra service to manage
- Jenkins: Self-hosted, more maintenance

---

## Monitoring & Analytics

### 19. Sentry (Error Tracking)

**Why Sentry?**
- ✅ **Error Tracking**: Catch production errors
- ✅ **Source Maps**: See original TypeScript code
- ✅ **User Context**: Know who hit errors
- ✅ **Alerts**: Email/Slack when errors spike
- ✅ **Performance**: Track slow pages

**Cost:**
- Free: 5,000 errors/month
- Team: $26/month, 50,000 errors

---

### 20. PostHog (Product Analytics)

**Why PostHog?**
- ✅ **Open Source**: Self-hostable
- ✅ **Privacy-Friendly**: GDPR compliant
- ✅ **Feature Flags**: A/B testing
- ✅ **Session Replay**: See user interactions
- ✅ **Funnels**: Conversion tracking

**What We'll Track:**
- Most used features
- Invoice creation flow
- User retention
- Feature adoption

---

## External Integrations

### 21. WhatsApp Business API

**Provider Options:**
- Twilio (reliable, expensive)
- MessageBird (moderate cost)
- 360dialog (good for Pakistan)
- Meta WhatsApp Cloud API (cheapest)

**Recommended:** Meta WhatsApp Cloud API
- Free for first 1,000 conversations/month
- $0.005 - $0.04 per conversation after
- Direct from Meta, most reliable

---

### 22. PDF Generation

**Options:**
1. **jsPDF** (Client-side)
   - Pros: No backend needed, fast
   - Cons: Limited features, no HTML rendering

2. **React-PDF** (React-based)
   - Pros: React components = PDF
   - Cons: Learning curve

3. **Puppeteer/Playwright** (Server-side)
   - Pros: Perfect HTML → PDF
   - Cons: Heavy, slow cold starts

**Recommended:** React-PDF for invoices (clean, branded)
**Alternative:** jsPDF for simple receipts

---

### 23. Barcode/QR Generation

**Recommended:**
- **jsbarcode**: Generate barcodes (EAN-13, Code-128)
- **react-qr-code**: Generate QR codes
- **quagga2**: Scan barcodes (camera)

All client-side, lightweight, free.

---

## Complete Package.json

```json
{
  "name": "evw-cloud-erp",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\""
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.0",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.9",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "recharts": "^3.5.0",
    "lucide-react": "^0.554.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.0.6",
    "react-pdf": "^7.7.0",
    "@react-pdf/renderer": "^3.1.15",
    "jsbarcode": "^3.11.5",
    "react-qr-code": "^2.0.12",
    "react-hot-toast": "^2.4.1",
    "@upstash/redis": "^1.28.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.1",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.2.0",
    "@playwright/test": "^1.40.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.2.4",
    "prettier-plugin-tailwindcss": "^0.5.11"
  }
}
```

---

## Environment Variables

```bash
# .env.local (Development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
VITE_UPSTASH_REDIS_REST_TOKEN=your-token
VITE_WHATSAPP_PHONE_NUMBER_ID=your-wa-number-id
VITE_WHATSAPP_ACCESS_TOKEN=your-wa-token
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
```

---

## Cost Summary

### Monthly Infrastructure Costs (Year 1)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase Pro | $25 | Database, Auth, Storage, Real-time |
| Vercel Pro | $20 | Frontend hosting, CDN |
| Upstash Redis | $10 | Caching (1M requests) |
| Sentry Team | $26 | Error tracking |
| PostHog | Free | Self-hosted or free tier |
| WhatsApp API | $20-50 | Usage-based (1,000 free) |
| Domain + SSL | $15 | evw.pk or evw.com.pk |
| **Total** | **$116-146/month** | ~14,000-18,000 PKR/month |

### Scaling Costs (As Usage Grows)

| Users | Monthly Cost | Notes |
|-------|-------------|-------|
| 1-10 | $116 | Initial setup |
| 10-50 | $200 | More storage, bandwidth |
| 50-100 | $350 | Upgrade database tier |
| 100-500 | $600 | Add replicas, CDN |
| 500+ | $1,000+ | Dedicated infrastructure |

---

## Development Timeline

### Phase 1: MVP (8-10 weeks)
**Cost:** $35,000 - $50,000

Week 1-2: Project setup, design system, database
Week 3-4: Authentication, product management
Week 5-6: Invoicing system with EVW branding
Week 7-8: Customer management, payments
Week 9-10: Dashboard, analytics, testing, deploy

### Phase 2: Advanced Features (4-6 weeks)
**Cost:** $20,000 - $30,000

Week 11-12: Stock audit, expense tracker
Week 13-14: WhatsApp integration, barcode system
Week 15-16: Advanced analytics, reports, optimization

### Total MVP to Full System
**Timeline:** 12-16 weeks (3-4 months)
**Cost:** $55,000 - $80,000
**Monthly Infrastructure:** $150/month

---

## Why This Stack Is Perfect for EVW

### ✅ **Speed to Market**
- MVP in 8-10 weeks vs 6+ months with custom backend

### ✅ **Cost-Effective**
- $150/month infrastructure vs $500-1,000 for traditional hosting
- 50% reduction in development time = 50% cost savings

### ✅ **Scalable**
- Easy upgrade path from single-tenant to SaaS
- No rewrite needed, just enable multi-tenancy

### ✅ **Modern**
- Latest technologies, best practices
- Great developer experience = faster features

### ✅ **Maintainable**
- TypeScript = fewer bugs
- Well-documented libraries
- Easy to onboard new developers

### ✅ **Performance**
- Sub-second page loads
- Real-time updates
- Global CDN = fast in Pakistan and abroad

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: Approved for Implementation
