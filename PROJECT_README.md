# EVW Cloud ERP - Complete Enterprise Resource Planning System

<div align="center">
  <h3>🌟 Premium Vape Wholesale & Retail Management System 🌟</h3>
  <p>Built for EVW - Pakistan's Leading Vape Distributor</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

EVW Cloud ERP is a comprehensive, cloud-based enterprise resource planning system designed specifically for EVW, a vape wholesale and online retail brand in Pakistan. The system provides end-to-end management of inventory, sales, customers, expenses, and analytics with full EVW branding integration.

### Key Highlights

- ✅ **Cloud-Based**: Access from anywhere, anytime
- ✅ **Real-Time**: Live inventory tracking and alerts
- ✅ **Professional Invoicing**: EVW-branded invoices with logo and bank details
- ✅ **Multi-Tier Pricing**: Support for cost, retail, and wholesale pricing
- ✅ **Comprehensive Analytics**: Detailed profit tracking and financial reports
- ✅ **Role-Based Access**: Secure multi-user system with permissions
- ✅ **Mobile-Friendly**: Responsive design for all devices
- ✅ **WhatsApp Integration**: Send invoices and reminders via WhatsApp

---

## 🚀 Features

### Core Modules

#### 1. **Authentication & User Management**
- Multi-user authentication with JWT
- Role-based access control (Super Admin, Admin, Manager, Staff, Viewer)
- Permission matrix for granular access control
- User activity logging
- Password reset and 2FA support

#### 2. **Product & Inventory Management**
- Complete product catalog with brand, flavor, strength
- Multi-tier pricing (purchase, retail, wholesale)
- Real-time stock tracking
- Low-stock alerts and reorder points
- Barcode/QR code generation and scanning
- Batch and expiry tracking
- Stock audit and reconciliation
- Inventory valuation (FIFO/LIFO/Weighted Average)

#### 3. **EVW Invoicing System**
- Fast product search and selection
- Multi-line item invoices
- Real-time price selection (retail/wholesale)
- Automatic calculations (subtotal, discount, tax, total)
- Per-line and total profit calculation
- **EVW Branded Templates**:
  - EVW logo (top-left corner)
  - Company details and address
  - Bank account details for payments
  - Professional layout (A4 + POS receipt formats)
- PDF generation for printing
- WhatsApp sharing capability

#### 4. **Customer Management**
- Complete customer database (retail/wholesale/distributor)
- Contact information and business details
- Credit limit management
- Outstanding balance tracking
- Payment history and customer ledger
- Customer tags and notes (VIP, Bulk Buyer, Late Payer, etc.)
- Order frequency analysis
- Customer lifetime value (CLV)

#### 5. **Payment Tracking**
- Multi-payment method support:
  - Cash
  - Bank Transfer
  - JazzCash
  - EasyPaisa
  - Credit/Debit Card
- Partial payment handling
- Payment schedules and reminders
- Overdue tracking
- Payment receipts

#### 6. **Expense Tracking**
- Categorized expense management
- Receipt upload and storage
- Payment method tracking
- Daily/monthly/yearly summaries
- Budget vs. actual tracking
- Automatic P&L integration

#### 7. **Analytics Dashboard**
- **Executive Dashboard**: KPIs, sales trends, profit metrics
- **Sales Dashboard**: Daily/monthly/yearly sales analysis
- **Profit Dashboard**: By product/brand/category/channel
- **Inventory Dashboard**: Stock levels, turnover, valuation
- **Customer Dashboard**: Top customers, segments, CLV
- **Expense Dashboard**: Spending patterns and trends
- **Interactive Charts**: Line, bar, pie, area charts with Recharts

#### 8. **Stock Audit System**
- Physical stock count interface
- Variance detection (system vs. physical)
- Discrepancy flagging and resolution
- Adjustment with reason codes
- Audit trail and reporting
- Multi-location support (future)

#### 9. **User Activity Audit**
- Complete audit trail of all actions
- Track who created/modified/deleted records
- Timestamps and IP addresses
- Before/after values for changes
- Admin audit panel

#### 10. **Automated Cloud Backups**
- Daily automated backups
- Point-in-time recovery
- Encrypted storage
- Backup verification
- Easy restore functionality

#### 11. **WhatsApp Integration**
- Send invoices as formatted messages
- Attach PDF invoices
- Send payment details and bank info
- Order confirmations
- Payment reminders for overdue invoices
- Custom broadcast messages

#### 12. **Barcode/QR Code System**
- Auto-generate barcodes/QR codes for products
- Print labels for shelf/warehouse use
- Scan to add to invoice
- Scan to check stock
- Scan to adjust inventory

---

## 🛠️ Tech Stack

### Frontend
- **React 19**: Latest React with concurrent features
- **TypeScript 5.8**: Full type safety
- **Vite 6**: Lightning-fast build tool
- **TailwindCSS 3**: Utility-first CSS framework
- **shadcn/ui**: Copy-paste component library
- **Radix UI**: Accessible UI primitives
- **Recharts**: Data visualization
- **Lucide React**: Beautiful icons

### State Management
- **Zustand**: Lightweight state management
- **React Query (TanStack Query)**: Server state and caching

### Forms & Validation
- **React Hook Form**: Performant form management
- **Zod**: TypeScript-first schema validation

### Backend (BaaS)
- **Supabase**: Backend-as-a-Service
  - PostgreSQL 15+ database
  - Built-in authentication (JWT + RLS)
  - Real-time subscriptions (WebSocket)
  - File storage (S3-compatible)
  - Edge Functions (Deno runtime)

### Infrastructure
- **Vercel**: Frontend hosting + CDN
- **Supabase Cloud**: Managed backend
- **GitHub Actions**: CI/CD pipeline
- **Sentry**: Error tracking
- **PostHog**: Product analytics

### Other Integrations
- **WhatsApp Business API**: Message sending
- **React-PDF / jsPDF**: PDF generation
- **jsbarcode**: Barcode generation
- **react-qr-code**: QR code generation

---

## 📁 Project Structure

```
evw-cloud-erp/
├── docs/                              # Complete documentation
│   ├── 01-SYSTEM-ARCHITECTURE.md      # System design and architecture
│   ├── 02-DATABASE-SCHEMA.md          # Complete database schema
│   ├── 03-TECH-STACK.md               # Tech stack with justifications
│   ├── 04-API-DOCUMENTATION.md        # API endpoints documentation
│   └── 05-DEVELOPMENT-ROADMAP.md      # Development timeline and phases
│
├── src/
│   ├── components/
│   │   ├── ui/                        # Reusable UI components (shadcn/ui)
│   │   ├── features/                  # Feature-specific components
│   │   │   ├── auth/                  # Authentication components
│   │   │   ├── products/              # Product management
│   │   │   ├── customers/             # Customer management
│   │   │   ├── invoices/              # Invoice system
│   │   │   ├── payments/              # Payment tracking
│   │   │   ├── expenses/              # Expense tracking
│   │   │   ├── analytics/             # Analytics and reports
│   │   │   └── dashboard/             # Main dashboard
│   │   └── layout/                    # Layout components
│   │
│   ├── lib/                           # Core utilities
│   │   ├── supabase.ts                # Supabase client configuration
│   │   └── utils.ts                   # Utility functions
│   │
│   ├── hooks/                         # Custom React hooks
│   ├── services/                      # API service layers
│   ├── stores/                        # Zustand stores
│   ├── types/                         # TypeScript types
│   ├── utils/                         # Helper functions
│   ├── constants/                     # App constants
│   └── config/                        # Configuration files
│
├── supabase/
│   ├── migrations/                    # Database migrations
│   └── functions/                     # Edge Functions
│
├── tests/
│   ├── unit/                          # Unit tests (Vitest)
│   ├── integration/                   # Integration tests
│   └── e2e/                           # End-to-end tests (Playwright)
│
├── public/                            # Static assets
├── .github/workflows/                 # CI/CD pipelines
│
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Vite configuration
├── tailwind.config.js                 # TailwindCSS configuration
├── .eslintrc.cjs                      # ESLint configuration
├── .prettierrc.json                   # Prettier configuration
└── README.md                          # This file
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v18+ (recommended: v20+)
- **npm**: v9+ or **yarn**: v1.22+
- **Supabase Account**: [Sign up at supabase.com](https://supabase.com)
- **Git**: For version control

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yaseenlenceria/EVW-Enterprise-Cloud.git
   cd EVW-Enterprise-Cloud
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up Supabase**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Run database migrations (see [Database Setup](#database-setup))
   - Configure authentication settings
   - Set up Row Level Security policies

5. **Start development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Database Setup

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Link to your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Run migrations**:
   ```bash
   supabase db push
   ```

4. **Seed initial data** (optional):
   ```bash
   supabase db seed
   ```

---

## 📚 Documentation

### Key Documents

1. **[System Architecture](./docs/01-SYSTEM-ARCHITECTURE.md)**: Complete system design, module breakdown, security architecture, and scalability strategy

2. **[Database Schema](./docs/02-DATABASE-SCHEMA.md)**: Full database schema with 18+ tables, relationships, indexes, triggers, and views

3. **[Tech Stack](./docs/03-TECH-STACK.md)**: Detailed technology choices with justifications and comparisons

4. **[API Documentation](./docs/04-API-DOCUMENTATION.md)**: Complete API reference with 100+ endpoints

5. **[Development Roadmap](./docs/05-DEVELOPMENT-ROADMAP.md)**: Phase-by-phase development plan with timelines and cost estimates

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run end-to-end tests with Playwright

# Code Quality
npm run lint             # Lint code with ESLint
npm run format           # Format code with Prettier
```

### Git Workflow

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add product barcode scanning
fix: resolve invoice calculation error
docs: update API documentation
```

---

## 🚀 Deployment

### Production Deployment

1. **Deploy Frontend to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel --prod
   ```

2. **Set up custom domain**:
   - Go to Vercel dashboard
   - Add your custom domain (e.g., evw.com.pk)
   - Configure DNS records

3. **Configure environment variables**:
   - Add all production environment variables in Vercel dashboard
   - Ensure Supabase production URL and keys are set

4. **Set up CI/CD**:
   - GitHub Actions workflow is already configured
   - Pushes to `main` branch auto-deploy to production

### Supabase Production Setup

1. Upgrade to Supabase Pro plan ($25/month)
2. Configure production database
3. Set up automated backups
4. Configure custom domain (if needed)
5. Enable monitoring and alerts

---

## 📊 Project Status

### Current Phase: MVP Development (Phase 1)

**Completed**:
- ✅ System architecture design
- ✅ Database schema design
- ✅ Tech stack selection
- ✅ API documentation
- ✅ Development roadmap
- ✅ Project setup and configuration

**In Progress**:
- 🚧 Database implementation
- 🚧 Authentication system
- 🚧 Product management module

**Next Steps**:
- 📋 Invoice system development
- 📋 Customer management
- 📋 Payment tracking
- 📋 Analytics dashboard

---

## 💰 Cost Breakdown

### Development Costs (MVP)
- **Phase 1 (MVP Core)**: $35,000 - $50,000
- **Phase 2 (Advanced Features)**: $20,000 - $30,000
- **Phase 3 (Testing & Optimization)**: $10,000 - $15,000
- **Total**: $65,000 - $95,000

### Monthly Infrastructure Costs
- **Supabase Pro**: $25/month
- **Vercel Pro**: $20/month
- **Other Services**: $15-30/month
- **Total**: ~$60-75/month initially

**Scaling Costs**:
- 100 users: ~$200-300/month
- 500 users: ~$400-600/month
- 1000+ users: ~$800-1,200/month

---

## 🎯 Success Metrics

### Technical KPIs
- ✅ Page load time: < 2 seconds (p95)
- ✅ API response time: < 200ms (p95)
- ✅ System uptime: > 99.5%
- ✅ Test coverage: > 80%
- ✅ Lighthouse score: > 90

### Business KPIs
- 📈 User adoption: > 90% within 1 month
- 📈 Invoice creation time: < 2 minutes (vs 5+ manual)
- 📈 Inventory accuracy: > 95%
- 📈 Payment collection: 30% faster
- 📈 Time saved: > 10 hours/week
- 📈 ROI: Positive within 6 months

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run lint` and `npm run format` before committing
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is proprietary software developed for EVW. All rights reserved.

**Copyright © 2025 EVW (Elite Vape Wholesale)**

---

## 📞 Support

For support, please contact:

- **Email**: support@evw.pk
- **Phone**: +92-XXX-XXXXXXX
- **GitHub Issues**: [Open an issue](https://github.com/yaseenlenceria/EVW-Enterprise-Cloud/issues)

---

## 🙏 Acknowledgments

- Built with ❤️ for EVW Pakistan
- Powered by [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

<div align="center">
  <p><strong>EVW Cloud ERP</strong> - Transforming Vape Business Management in Pakistan</p>
  <p>Made with 💚 by the EVW Development Team</p>
</div>
