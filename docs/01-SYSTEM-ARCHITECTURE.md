# EVW Cloud ERP - System Architecture

## Executive Summary

EVW Cloud ERP is a comprehensive cloud-based Enterprise Resource Planning system designed specifically for EVW, a vape wholesale and online retail brand in Pakistan. The system provides end-to-end management of inventory, sales, customers, expenses, and analytics with full EVW branding integration.

## System Overview

### Core Purpose
- Centralized management of EVW wholesale and retail operations
- Real-time inventory tracking and alerts
- Professional branded invoicing with EVW logo and bank details
- Comprehensive profit tracking and analytics
- Multi-user access with role-based permissions
- Cloud-based accessibility from anywhere

### Key Differentiators
- Pakistan-specific features (PKR, local payment methods, tax rules)
- Multi-tier pricing (purchase, retail, wholesale)
- Complete profit visibility at every level
- EVW branding on all customer-facing documents
- Designed for future SaaS expansion

## System Architecture

### Architecture Pattern: **Modular Monolith with Microservices Readiness**

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Web App)                   │
│  React 19 + TypeScript + Vite + TailwindCSS + Recharts     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│              RESTful API + WebSocket for real-time          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Auth &     │   Inventory   │      Invoicing          │ │
│  │   Users      │   Management  │      System             │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Customer   │   Expense     │      Analytics          │ │
│  │   Management │   Tracking    │      Engine             │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Payment    │   Audit Logs  │      Notifications      │ │
│  │   Tracking   │   System      │      Service            │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                        │
│           TypeScript Services + Storage Abstraction          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│                    PostgreSQL (Supabase)                     │
│    + Redis Cache + Cloud Storage (S3/Supabase Storage)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services Layer                     │
│  WhatsApp API │ PDF Generation │ Backup Service │ Barcode   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework for building interactive interfaces |
| **TypeScript** | 5.8.2 | Type safety and better developer experience |
| **Vite** | 6.2.0 | Fast build tool and dev server |
| **TailwindCSS** | Latest | Utility-first CSS framework for rapid UI development |
| **Recharts** | 3.5.0 | Data visualization and analytics charts |
| **Lucide React** | Latest | Beautiful, consistent icon library |
| **React Query** | (To Add) | Server state management and caching |
| **Zustand** | (To Add) | Lightweight client state management |
| **React Hook Form** | (To Add) | Efficient form management with validation |
| **Zod** | (To Add) | TypeScript-first schema validation |

### Backend Stack
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth + Storage + Realtime) |
| **PostgreSQL 15+** | Primary relational database |
| **Row Level Security** | Database-level access control |
| **Supabase Edge Functions** | Serverless API endpoints (Deno runtime) |
| **Redis** | Caching layer for performance optimization |

### Infrastructure & DevOps
| Technology | Purpose |
|------------|---------|
| **Supabase Cloud** | Managed PostgreSQL, Auth, Storage, Realtime |
| **Vercel** | Frontend hosting and CDN |
| **GitHub Actions** | CI/CD pipeline |
| **Docker** | Containerization for consistent environments |
| **CloudFlare** | DNS, CDN, DDoS protection |

### Third-Party Integrations
| Service | Purpose |
|---------|---------|
| **WhatsApp Business API** | Send invoices and order confirmations |
| **PDF Generation Library** | Generate branded PDF invoices (jsPDF/PDFKit) |
| **Barcode/QR Libraries** | jsbarcode + QRCode.js for product labeling |
| **Google Cloud Storage** | Receipt and document storage backup |
| **Sentry** | Error tracking and monitoring |
| **PostHog/Mixpanel** | Product analytics |

## Module Architecture

### 1. Authentication & User Management Module
```typescript
Features:
- Multi-user authentication (email/password + 2FA)
- Role-based access control (RBAC)
  Roles: Super Admin, Admin, Manager, Staff, Viewer
- Permission matrix for granular access control
- User activity logging
- Session management
- Password reset and security policies
```

### 2. Inventory Management Module
```typescript
Core Entities:
- Products (SKU, brand, flavor, strength, pricing)
- Stock movements (in/out/damaged)
- Batches (with expiry dates)
- Suppliers
- Purchase orders
- Stock audit trails

Features:
- Multi-tier pricing (cost, retail, wholesale)
- Low-stock alerts and reorder points
- Batch and expiry tracking
- Barcode/QR code integration
- Inventory valuation (FIFO/LIFO/Weighted Average)
- Stock audit and reconciliation
```

### 3. EVW Invoicing System Module
```typescript
Core Features:
- Fast product search with autocomplete
- Multi-line item invoices
- Real-time price selection (retail/wholesale)
- Automatic calculations (subtotal, discount, tax, total)
- Per-line profit calculation
- Total invoice profit calculation
- Customer history integration

Branding Elements:
- EVW logo (top-left corner)
- Company details (name, address, contact)
- Bank account details (multiple accounts)
- Professional layout (A4 + POS receipt formats)
- PDF generation for printing
- WhatsApp sharing capability
```

### 4. Customer Management Module
```typescript
Features:
- Customer profiles (retail/wholesale/distributor)
- Contact information and addresses
- Credit limit management
- Outstanding balance tracking
- Payment history
- Customer tags and notes
- Order frequency analysis
- Customer lifetime value (CLV)
```

### 5. Expense Tracking Module
```typescript
Features:
- Expense categorization
- Receipt upload and storage
- Payment method tracking
- Multi-category expenses
- Daily/monthly/yearly summaries
- Budget vs. actual tracking
- Automatic P&L integration
```

### 6. Analytics & Reporting Module
```typescript
Dashboards:
- Executive Dashboard (KPIs, trends)
- Sales Dashboard (daily/monthly/yearly)
- Profit Dashboard (by product/brand/category)
- Inventory Dashboard (stock levels, turnover)
- Customer Dashboard (top customers, segments)
- Expense Dashboard (spending patterns)

Reports:
- P&L Statement
- Balance Sheet
- Cash Flow Statement
- Sales Reports (detailed, summary)
- Inventory Valuation Report
- Customer Ledger
- Tax Reports
- Stock Movement Report
```

### 7. Payment Tracking Module
```typescript
Features:
- Multi-payment method support:
  - Cash
  - Bank Transfer
  - JazzCash
  - EasyPaisa
  - Credit/Debit Card
- Partial payment handling
- Payment schedules
- Overdue tracking
- Payment reminders (email/SMS/WhatsApp)
- Receipt generation
```

### 8. Stock Audit Module
```typescript
Features:
- Physical stock count interface
- Variance detection (system vs. physical)
- Discrepancy flagging
- Adjustment with reason codes
- Audit trail and reporting
- Multi-location support
- Scheduled audits
```

### 9. User Activity Audit Module
```typescript
Tracked Actions:
- Login/logout events
- Invoice creation/editing/deletion
- Stock adjustments
- Price changes
- Customer modifications
- Expense entries
- Report generation

Audit Log Fields:
- User ID and name
- Action type
- Timestamp
- IP address
- Changed data (before/after)
- Reason/notes
```

### 10. Automated Backup Module
```typescript
Features:
- Daily automated backups
- Point-in-time recovery
- Backup encryption
- Cloud storage (AWS S3/Google Cloud)
- Backup verification
- Restore functionality
- Backup retention policies (30/60/90 days)
```

### 11. WhatsApp Integration Module
```typescript
Features:
- Send invoice as formatted message
- Attach PDF invoice
- Send payment details and bank info
- Order confirmations
- Payment reminders
- Stock alerts for wholesale customers
- Template management
```

### 12. Barcode/QR Code Module
```typescript
Features:
- Auto-generate barcodes for SKUs
- QR code generation for products
- Batch label printing
- Scan-to-invoice functionality
- Scan-to-stock functionality
- Mobile scanner support
- Custom barcode formats (EAN-13, Code-128)
```

## Data Flow Diagrams

### Invoice Creation Flow
```
User → Select Customer → Add Products (Search/Scan)
→ Select Price Type → Apply Discounts
→ Calculate Profit → Generate Invoice
→ Record Payment → Update Stock → Save to DB
→ Generate PDF → Optional: Send WhatsApp
```

### Stock Management Flow
```
Purchase Order Created → Supplier Ships
→ Goods Received → Stock In
→ Update Inventory → Log Movement
→ Update Valuation → Trigger Alerts (if needed)
```

### Payment Flow
```
Invoice Created → Payment Due
→ Payment Received (Full/Partial)
→ Record Payment Method → Update Customer Balance
→ Update Cash Flow → Generate Receipt
→ Send Confirmation
```

## Security Architecture

### Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Row Level Security (RLS)** in PostgreSQL
- **Role-based access control (RBAC)** with permission matrix
- **2FA (Two-Factor Authentication)** for admin users
- **IP whitelisting** for sensitive operations
- **Session timeout** and concurrent session management

### Data Security
- **Encryption at rest**: AES-256 for database
- **Encryption in transit**: TLS 1.3 for all API calls
- **Field-level encryption**: For sensitive data (bank details, customer info)
- **Audit logging**: All data modifications tracked
- **Backup encryption**: All backups encrypted before storage

### API Security
- **Rate limiting**: Prevent abuse and DDoS
- **API key rotation**: Regular key updates
- **CORS policies**: Restricted domains
- **Input validation**: Zod schemas for all inputs
- **SQL injection prevention**: Parameterized queries
- **XSS prevention**: Content Security Policy (CSP)

## Scalability Strategy

### Current Phase: Single-Tenant (EVW Only)
- Optimized for EVW's operations
- Direct database queries
- Single instance deployment

### Phase 2: Multi-Tenant SaaS Preparation
- **Database Strategy**: Schema-per-tenant OR Row-level tenant isolation
- **Tenant identification**: Subdomain (evw.yoursaas.com) or path (/evw)
- **Data isolation**: Complete separation between tenants
- **Resource allocation**: Per-tenant limits and quotas

### Phase 3: Full SaaS Platform
- **Subscription management**: Stripe integration
- **Billing system**: Automated invoicing for SaaS customers
- **Tenant onboarding**: Self-service signup and provisioning
- **White-labeling**: Custom branding per tenant
- **API access**: Public API for integrations
- **Marketplace**: Plugin/extension ecosystem

### Performance Optimization
- **Database indexing**: On frequently queried fields
- **Query optimization**: Analyzed and optimized queries
- **Caching layer**: Redis for frequent reads
- **CDN**: Static assets served via CloudFlare
- **Lazy loading**: Code splitting for faster initial load
- **Image optimization**: Compressed and WebP format
- **Database connection pooling**: Efficient connection management

## Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────────────┐
│              CloudFlare (CDN + DNS)             │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           Vercel (Frontend Hosting)             │
│     Multiple Edge Locations Worldwide           │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         Supabase Cloud (Backend)                │
│  - PostgreSQL Database (Primary)                │
│  - Read Replicas (for analytics)                │
│  - Edge Functions (API)                         │
│  - Realtime Server (WebSocket)                  │
│  - Storage (S3-compatible)                      │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         External Services                        │
│  - Redis Cloud (Caching)                        │
│  - AWS S3 (Backup Storage)                      │
│  - Sentry (Error Tracking)                      │
│  - PostHog (Analytics)                          │
└─────────────────────────────────────────────────┘
```

### Development Environment
- Local Vite dev server for frontend
- Supabase local development with Docker
- Local PostgreSQL and Redis containers
- Environment-specific configurations (.env files)

### Staging Environment
- Identical to production setup
- Separate database instance
- Test data population scripts
- Used for QA and client demos

## Monitoring & Maintenance

### Application Monitoring
- **Error tracking**: Sentry for frontend and backend errors
- **Performance monitoring**: Lighthouse scores, Core Web Vitals
- **Uptime monitoring**: UptimeRobot or Pingdom
- **Log aggregation**: Supabase logs + CloudWatch

### Database Monitoring
- **Query performance**: Slow query logs
- **Connection pool**: Monitor active connections
- **Storage usage**: Disk space alerts
- **Backup verification**: Automated restore tests

### Alerting
- **Critical errors**: Immediate Slack/email alerts
- **Performance degradation**: Threshold-based alerts
- **Security events**: Failed login attempts, suspicious activity
- **Business metrics**: Low stock, overdue payments

## Disaster Recovery Plan

### Backup Strategy
- **Database**: Automated daily backups, retained for 30 days
- **File storage**: Replicated across multiple regions
- **Configuration**: Version-controlled in Git

### Recovery Procedures
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour (transaction logs)
- **Failover**: Automatic database failover to replica
- **Restore testing**: Monthly restore drills

## Compliance & Legal

### Data Privacy
- **GDPR compliance**: User data rights (access, deletion, portability)
- **Data retention**: Configurable retention policies
- **Privacy policy**: Clear documentation of data usage

### Financial Compliance
- **Audit trail**: Immutable logs for all financial transactions
- **Tax compliance**: Pakistani tax calculation rules
- **Invoice numbering**: Sequential, non-editable invoice numbers
- **Record retention**: 7-year financial record retention

## Future Roadmap

### Phase 1 (MVP): EVW Core System (2-3 months)
- Basic inventory, invoicing, expenses, customers
- EVW branding implementation
- Essential analytics

### Phase 2: Advanced Features (1-2 months)
- Stock audit system
- WhatsApp integration
- Barcode/QR scanning
- Advanced profit analytics

### Phase 3: Mobile App (2-3 months)
- React Native mobile app
- Offline-first capabilities
- Mobile barcode scanning
- Push notifications

### Phase 4: SaaS Transformation (3-4 months)
- Multi-tenancy architecture
- Subscription management
- White-labeling
- Public API

### Phase 5: Marketplace & Ecosystem (Ongoing)
- Third-party integrations
- Plugin system
- Partner API
- Industry-specific templates

## Cost Estimates

### Development Costs (MVP - Phase 1 & 2)
| Resource | Rate | Duration | Cost (USD) |
|----------|------|----------|------------|
| Senior Full-Stack Developer | $50-80/hr | 400-500 hrs | $20,000 - $40,000 |
| UI/UX Designer | $40-60/hr | 80-100 hrs | $3,200 - $6,000 |
| QA Engineer | $30-50/hr | 100-120 hrs | $3,000 - $6,000 |
| DevOps Engineer | $60-90/hr | 40-60 hrs | $2,400 - $5,400 |
| Project Manager | $50-70/hr | 120-150 hrs | $6,000 - $10,500 |
| **Total Development** | | | **$34,600 - $67,900** |

### Infrastructure Costs (Monthly)
| Service | Cost (USD/month) |
|---------|------------------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| CloudFlare Pro | $20 |
| Redis Cloud | $10-30 |
| AWS S3 Backup | $10-20 |
| Sentry | $26 (Team plan) |
| WhatsApp Business API | $20-100 (usage-based) |
| **Total Monthly** | **$131 - $241** |

### Scaling Costs (As you grow)
- **100 users**: ~$200-300/month
- **500 users**: ~$400-600/month
- **1000+ users**: ~$800-1,200/month

## Success Metrics

### Business KPIs
- Invoice generation time: < 2 minutes
- System uptime: > 99.5%
- Page load time: < 2 seconds
- Mobile responsiveness: 100%
- User adoption rate: > 80% (for EVW staff)

### Technical KPIs
- API response time: < 200ms (p95)
- Database query time: < 50ms (p95)
- Error rate: < 0.1%
- Test coverage: > 80%
- Code quality score: A (SonarQube)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Author**: EVW Cloud ERP Development Team
**Status**: Approved for Implementation
