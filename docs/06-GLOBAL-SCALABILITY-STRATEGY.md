# EVW ERP - Global Scalability & Multi-Tenancy Strategy

## Executive Summary

This document outlines the comprehensive strategy for transforming EVW ERP from a single-tenant Pakistan-focused vape management system into a **global, multi-industry SaaS platform** serving businesses worldwide.

---

## Phase 1: Current State (Single-Tenant - EVW Pakistan)

### Architecture: Monolithic with Modular Design
- Single database for EVW
- Single Supabase project
- EVW-specific branding hardcoded
- Pakistani Rupee (PKR) only
- English/Urdu language support
- Pakistani business rules (NTN, STRN, CNIC)

### Timeline: 0-6 months
**Focus**: Build solid foundation for EVW Pakistan operations

---

## Phase 2: Multi-Tenant Preparation (Months 6-9)

### Architecture Changes Required

#### 1. Database Multi-Tenancy Strategy

**Option A: Schema-per-Tenant (Recommended for Security)**
```sql
-- Create separate schema for each tenant
CREATE SCHEMA tenant_evw_pk;
CREATE SCHEMA tenant_vapeshop_ae;
CREATE SCHEMA tenant_cloudvape_uk;

-- All tables exist in each schema
CREATE TABLE tenant_evw_pk.products (...);
CREATE TABLE tenant_vapeshop_ae.products (...);
```

**Pros**:
- Complete data isolation
- Easy backup/restore per tenant
- Better security
- Simple to understand

**Cons**:
- More complex migrations
- More database connections

**Option B: Shared Schema with tenant_id (Easier to Manage)**
```sql
-- Add tenant_id to all tables
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  ...
  CONSTRAINT unique_sku_per_tenant UNIQUE (tenant_id, sku)
);

-- Create composite indexes
CREATE INDEX idx_products_tenant ON products(tenant_id, sku);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id, invoice_date);
```

**Pros**:
- Easier migrations (one schema)
- Simpler queries
- Better for analytics across tenants

**Cons**:
- Must ensure tenant_id in every query
- Risk of data leakage if misconfigured
- Row Level Security (RLS) critical

**Recommendation**: Start with **Option B (Shared Schema with tenant_id)** for easier management, then migrate to Option A if needed.

#### 2. Tenant Table Structure

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- evw-pk, vapeshop-ae, cloudvape-uk
  domain VARCHAR(255) UNIQUE, -- custom.domain.com (enterprise only)

  -- Subscription
  plan VARCHAR(50) NOT NULL, -- STARTER, PROFESSIONAL, ENTERPRISE
  status VARCHAR(50) NOT NULL, -- TRIAL, ACTIVE, SUSPENDED, CANCELLED
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,

  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),

  -- Localization
  country_code VARCHAR(5) NOT NULL, -- PK, AE, UK, SA, MY
  currency_code VARCHAR(10) NOT NULL, -- PKR, AED, GBP, SAR, MYR
  timezone VARCHAR(100) NOT NULL, -- Asia/Karachi, Asia/Dubai
  language VARCHAR(10) DEFAULT 'en', -- en, ur, ar

  -- Business Details
  business_name VARCHAR(255),
  business_type VARCHAR(50), -- VAPE, PERFUME, COSMETICS, SUPPLEMENTS, GENERAL
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),

  -- Contact
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),

  -- Limits (based on plan)
  max_users INTEGER DEFAULT 5,
  max_products INTEGER DEFAULT 1000,
  max_invoices_per_month INTEGER DEFAULT 500,
  max_storage_mb INTEGER DEFAULT 1000,

  -- Usage Tracking
  current_users INTEGER DEFAULT 0,
  current_products INTEGER DEFAULT 0,
  invoices_this_month INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,

  -- Features (JSON)
  features JSONB DEFAULT '{
    "whatsapp_integration": false,
    "barcode_scanning": true,
    "multi_location": false,
    "api_access": false,
    "custom_domain": false,
    "white_label": false,
    "advanced_analytics": false
  }'::jsonb,

  -- Settings
  settings JSONB DEFAULT '{
    "invoice_prefix": "INV",
    "tax_enabled": false,
    "tax_percentage": 0,
    "low_stock_threshold": 10
  }'::jsonb,

  -- Billing
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan ON tenants(plan);
```

#### 3. Modified Users Table (Multi-Tenant)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
  permissions JSONB DEFAULT '[]'::jsonb,

  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_email_per_tenant UNIQUE (tenant_id, email)
);
```

#### 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY "tenant_isolation_policy" ON products
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Repeat for all tables
CREATE POLICY "tenant_isolation_policy" ON customers
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "tenant_isolation_policy" ON invoices
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE users.id = auth.uid()));
```

---

## Phase 3: Multi-Currency Support

### Currency Conversion Strategy

#### 1. Supported Currencies

| Country | Currency | Symbol | Code |
|---------|----------|--------|------|
| Pakistan | Pakistani Rupee | Rs. | PKR |
| UAE | UAE Dirham | د.إ | AED |
| Saudi Arabia | Saudi Riyal | ﷼ | SAR |
| UK | British Pound | £ | GBP |
| Malaysia | Malaysian Ringgit | RM | MYR |
| USA | US Dollar | $ | USD |

#### 2. Currency Configuration Table

```sql
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- PKR, AED, GBP
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency VARCHAR(10) NOT NULL REFERENCES currencies(code),
  to_currency VARCHAR(10) NOT NULL REFERENCES currencies(code),
  rate DECIMAL(20, 10) NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(100), -- openexchangerates.org, xe.com
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_exchange_rate UNIQUE (from_currency, to_currency, effective_date)
);

-- Insert supported currencies
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
  ('PKR', 'Pakistani Rupee', 'Rs.', 0),
  ('AED', 'UAE Dirham', 'د.إ', 2),
  ('SAR', 'Saudi Riyal', '﷼', 2),
  ('GBP', 'British Pound', '£', 2),
  ('MYR', 'Malaysian Ringgit', 'RM', 2),
  ('USD', 'US Dollar', '$', 2);
```

#### 3. Multi-Currency Product Pricing

```sql
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  currency_code VARCHAR(10) NOT NULL REFERENCES currencies(code),

  cost_price DECIMAL(15, 4) NOT NULL,
  retail_price DECIMAL(15, 4) NOT NULL,
  wholesale_price DECIMAL(15, 4) NOT NULL,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_product_currency UNIQUE (product_id, currency_code)
);

-- Automatically convert prices when tenant changes currency
CREATE OR REPLACE FUNCTION convert_product_prices(
  p_product_id UUID,
  p_from_currency VARCHAR(10),
  p_to_currency VARCHAR(10)
)
RETURNS VOID AS $$
DECLARE
  v_rate DECIMAL(20, 10);
  v_cost DECIMAL(15, 4);
  v_retail DECIMAL(15, 4);
  v_wholesale DECIMAL(15, 4);
BEGIN
  -- Get exchange rate
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND effective_date <= CURRENT_DATE
  ORDER BY effective_date DESC
  LIMIT 1;

  -- Get current prices
  SELECT cost_price, retail_price, wholesale_price
  INTO v_cost, v_retail, v_wholesale
  FROM product_prices
  WHERE product_id = p_product_id
    AND currency_code = p_from_currency;

  -- Insert converted prices
  INSERT INTO product_prices (
    product_id, tenant_id, currency_code,
    cost_price, retail_price, wholesale_price
  )
  SELECT
    p_product_id,
    tenant_id,
    p_to_currency,
    v_cost * v_rate,
    v_retail * v_rate,
    v_wholesale * v_rate
  FROM products
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;
```

#### 4. Update Exchange Rates (Cron Job)

```typescript
// supabase/functions/update-exchange-rates/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Fetch latest rates
    const response = await fetch(EXCHANGE_RATE_API)
    const data = await response.json()

    // Insert rates for all currency pairs
    const currencies = ['PKR', 'AED', 'SAR', 'GBP', 'MYR', 'USD']

    for (const from of currencies) {
      for (const to of currencies) {
        if (from !== to) {
          const rate = data.rates[to] / data.rates[from]

          await supabase.from('exchange_rates').insert({
            from_currency: from,
            to_currency: to,
            rate: rate,
            effective_date: new Date().toISOString().split('T')[0],
            source: 'exchangerate-api.com',
          })
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

---

## Phase 4: Multi-Language Support (i18n)

### Internationalization Strategy

#### 1. Supported Languages

| Language | Code | Countries | Priority |
|----------|------|-----------|----------|
| English | en | Global | High |
| Urdu | ur | Pakistan | High |
| Arabic | ar | UAE, Saudi | High |
| Malay | ms | Malaysia | Medium |
| Chinese | zh | Singapore | Low |

#### 2. Translation Architecture

**Option 1: Static Translation Files (Recommended for MVP)**

```typescript
// src/i18n/locales/en.json
{
  "common": {
    "welcome": "Welcome",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalRevenue": "Total Revenue",
    "totalProfit": "Total Profit"
  },
  "products": {
    "title": "Products",
    "addProduct": "Add Product",
    "sku": "SKU",
    "brand": "Brand"
  }
}

// src/i18n/locales/ur.json (Urdu)
{
  "common": {
    "welcome": "خوش آمدید",
    "save": "محفوظ کریں",
    "cancel": "منسوخ کریں",
    "delete": "حذف کریں"
  },
  "dashboard": {
    "title": "ڈیش بورڈ",
    "totalRevenue": "کل آمدنی",
    "totalProfit": "کل منافع"
  }
}

// src/i18n/locales/ar.json (Arabic)
{
  "common": {
    "welcome": "مرحبا",
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف"
  }
}
```

**Implementation with react-i18next**:

```typescript
// src/i18n/config.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import ur from './locales/ur.json'
import ar from './locales/ar.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n

// Usage in components
import { useTranslation } from 'react-i18next'

function Dashboard() {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.totalRevenue')}: {formatCurrency(12345)}</p>

      <button onClick={() => i18n.changeLanguage('ur')}>اردو</button>
      <button onClick={() => i18n.changeLanguage('ar')}>العربية</button>
    </div>
  )
}
```

**Option 2: Database-Driven Translations (For Future)**

```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL, -- "dashboard.title"
  language VARCHAR(10) NOT NULL, -- "en", "ur", "ar"
  value TEXT NOT NULL, -- "Dashboard", "ڈیش بورڈ"

  CONSTRAINT unique_translation UNIQUE (key, language)
);
```

#### 3. Right-to-Left (RTL) Support

```typescript
// src/lib/rtl.ts
export const RTL_LANGUAGES = ['ar', 'ur']

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language)
}

// Apply RTL to HTML
useEffect(() => {
  const direction = isRTL(i18n.language) ? 'rtl' : 'ltr'
  document.documentElement.dir = direction
  document.documentElement.lang = i18n.language
}, [i18n.language])
```

```css
/* RTL-specific styles in Tailwind */
.rtl\:text-right {
  text-align: right;
}

[dir="rtl"] .ml-4 {
  margin-right: 1rem;
  margin-left: 0;
}
```

---

## Phase 5: Multi-Country Tax Support

### Tax Configuration System

```sql
CREATE TABLE tax_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(5) NOT NULL, -- PK, AE, SA, UK
  region_name VARCHAR(100), -- Punjab, Dubai, Riyadh

  tax_name VARCHAR(100) NOT NULL, -- GST, VAT, Sales Tax
  tax_type VARCHAR(50) NOT NULL, -- PERCENTAGE, FIXED
  tax_rate DECIMAL(5, 2) NOT NULL, -- 18.00 (for 18%)

  applies_to VARCHAR(50) DEFAULT 'ALL', -- ALL, GOODS, SERVICES

  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert tax configurations
INSERT INTO tax_regions (country_code, tax_name, tax_type, tax_rate, effective_from) VALUES
  ('PK', 'Sales Tax', 'PERCENTAGE', 18.00, '2024-01-01'),
  ('AE', 'VAT', 'PERCENTAGE', 5.00, '2024-01-01'),
  ('SA', 'VAT', 'PERCENTAGE', 15.00, '2024-01-01'),
  ('GB', 'VAT', 'PERCENTAGE', 20.00, '2024-01-01'),
  ('MY', 'SST', 'PERCENTAGE', 6.00, '2024-01-01');
```

### Tax Calculation Function

```typescript
// src/lib/tax.ts
interface TaxConfig {
  taxName: string
  taxRate: number
  taxType: 'PERCENTAGE' | 'FIXED'
}

export function calculateTax(
  amount: number,
  taxConfig: TaxConfig
): { taxAmount: number; totalWithTax: number } {
  let taxAmount = 0

  if (taxConfig.taxType === 'PERCENTAGE') {
    taxAmount = (amount * taxConfig.taxRate) / 100
  } else {
    taxAmount = taxConfig.taxRate
  }

  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalWithTax: amount + taxAmount,
  }
}

// Usage in invoice
const subtotal = 10000
const taxConfig = await getTaxConfig(tenant.countryCode)
const { taxAmount, totalWithTax } = calculateTax(subtotal, taxConfig)
```

---

## Phase 6: Multi-Industry Adaptation

### Industry-Specific Configurations

```sql
CREATE TABLE industry_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_type VARCHAR(50) NOT NULL, -- VAPE, PERFUME, COSMETICS, SUPPLEMENTS

  -- Product Fields
  product_fields JSONB NOT NULL,
  /* Example for VAPE:
  {
    "fields": [
      {"name": "flavor", "type": "text", "required": true},
      {"name": "strength", "type": "text", "required": true},
      {"name": "series", "type": "text", "required": false}
    ]
  }
  */

  -- Custom Categories
  categories JSONB NOT NULL,
  /* Example:
  {
    "categories": ["E-Liquid", "Pod System", "Disposable", "Coil", "Battery"]
  }
  */

  -- Unit Types
  unit_types JSONB NOT NULL,
  /* Example:
  {
    "units": ["ml", "piece", "pack", "carton"]
  }
  */

  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert industry templates
INSERT INTO industry_templates (industry_type, product_fields, categories, unit_types) VALUES
(
  'VAPE',
  '{
    "fields": [
      {"name": "flavor", "type": "text", "required": true, "label": "Flavor"},
      {"name": "strength", "type": "select", "required": true, "label": "Strength (mg)", "options": ["0mg", "3mg", "6mg", "12mg", "18mg", "50mg"]},
      {"name": "series", "type": "text", "required": false, "label": "Series"}
    ]
  }',
  '{"categories": ["E-Liquid", "Pod System", "Disposable Vape", "Vape Coil", "Vape Battery", "Vape Kit", "Accessory"]}',
  '{"units": ["ml", "piece", "pack", "carton"]}'
),
(
  'PERFUME',
  '{
    "fields": [
      {"name": "scent_family", "type": "select", "required": true, "label": "Scent Family", "options": ["Floral", "Oriental", "Woody", "Fresh", "Fruity"]},
      {"name": "concentration", "type": "select", "required": true, "label": "Concentration", "options": ["Eau de Parfum", "Eau de Toilette", "Eau de Cologne"]},
      {"name": "size", "type": "number", "required": true, "label": "Size (ml)"}
    ]
  }',
  '{"categories": ["Men Perfume", "Women Perfume", "Unisex", "Attar", "Body Spray", "Gift Set"]}',
  '{"units": ["ml", "bottle", "set"]}'
),
(
  'COSMETICS',
  '{
    "fields": [
      {"name": "shade", "type": "text", "required": false, "label": "Shade/Color"},
      {"name": "skin_type", "type": "select", "required": false, "label": "Skin Type", "options": ["All", "Oily", "Dry", "Combination", "Sensitive"]},
      {"name": "volume", "type": "text", "required": false, "label": "Volume/Weight"}
    ]
  }',
  '{"categories": ["Makeup", "Skincare", "Haircare", "Nails", "Tools & Brushes", "Fragrance"]}',
  '{"units": ["piece", "ml", "g", "set"]}'
);
```

### Dynamic Product Form Based on Industry

```typescript
// src/components/features/products/ProductForm.tsx
import { useIndustryTemplate } from '@/hooks/useIndustryTemplate'

function ProductForm() {
  const { tenant } = useTenant()
  const { template } = useIndustryTemplate(tenant.businessType)

  return (
    <form>
      {/* Standard fields */}
      <Input name="name" label="Product Name" />
      <Input name="sku" label="SKU" />
      <Select name="brand" label="Brand" />

      {/* Dynamic industry-specific fields */}
      {template.productFields.fields.map((field) => (
        <DynamicField key={field.name} field={field} />
      ))}

      {/* Category dropdown based on industry */}
      <Select name="category" label="Category">
        {template.categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>
    </form>
  )
}
```

---

## Phase 7: Tenant Subdomain & Custom Domain

### Subdomain Architecture

```
evw-pk.yourapp.com      → EVW Pakistan
vapeshop-ae.yourapp.com → VapeShop UAE
cloudvape-uk.yourapp.com → CloudVape UK
```

### Implementation

#### 1. DNS Wildcard Configuration

```
# Cloudflare DNS Settings
Type: A
Name: *.yourapp.com
Content: <your-server-ip>
Proxy: Enabled
```

#### 2. Tenant Resolution Middleware

```typescript
// src/middleware/tenantResolver.ts
import { supabase } from '@/lib/supabase'

export async function resolveTenant(hostname: string) {
  // Extract subdomain
  const subdomain = hostname.split('.')[0]

  // Check if it's the main domain
  if (subdomain === 'app' || subdomain === 'www') {
    return null // Show landing page or login
  }

  // Find tenant by slug
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', subdomain)
    .single()

  if (error || !tenant) {
    throw new Error('Tenant not found')
  }

  return tenant
}

// Usage in App
import { useEffect, useState } from 'react'
import { resolveTenant } from './middleware/tenantResolver'

function App() {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hostname = window.location.hostname
    resolveTenant(hostname)
      .then(setTenant)
      .catch(() => {
        // Redirect to main site or show error
        window.location.href = 'https://yourapp.com'
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!tenant) return <LandingPage />

  return <TenantApp tenant={tenant} />
}
```

#### 3. Custom Domain (Enterprise Feature)

```sql
-- Add custom domain to tenant
UPDATE tenants
SET domain = 'erp.evw.com.pk'
WHERE id = 'evw-tenant-id';

-- Verify domain ownership (like Vercel does)
CREATE TABLE domain_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  domain VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Domain Verification Process**:
1. Tenant enters custom domain: `erp.evw.com.pk`
2. System generates verification token: `evw-verify-abc123xyz`
3. Tenant adds TXT record to DNS:
   ```
   Type: TXT
   Name: _yourapp-verify
   Value: evw-verify-abc123xyz
   ```
4. System verifies DNS record
5. Once verified, tenant can use custom domain

---

## Phase 8: Feature Flags & Plan-Based Access

### Subscription Plans

```typescript
// src/config/plans.ts
export const PLANS = {
  STARTER: {
    name: 'Starter',
    price: {
      PKR: 2999,
      AED: 99,
      GBP: 19,
      USD: 25,
    },
    limits: {
      maxUsers: 2,
      maxProducts: 500,
      maxInvoicesPerMonth: 100,
      maxStorageMB: 500,
    },
    features: {
      basicInventory: true,
      basicInvoicing: true,
      basicReports: true,
      whatsappIntegration: false,
      barcodeScanning: true,
      multiLocation: false,
      apiAccess: false,
      customDomain: false,
      whiteLabel: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: {
      PKR: 7999,
      AED: 299,
      GBP: 59,
      USD: 75,
    },
    limits: {
      maxUsers: 10,
      maxProducts: 5000,
      maxInvoicesPerMonth: 1000,
      maxStorageMB: 5000,
    },
    features: {
      basicInventory: true,
      basicInvoicing: true,
      basicReports: true,
      whatsappIntegration: true,
      barcodeScanning: true,
      multiLocation: true,
      apiAccess: true,
      customDomain: false,
      whiteLabel: false,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: {
      PKR: 19999,
      AED: 799,
      GBP: 149,
      USD: 199,
    },
    limits: {
      maxUsers: -1, // Unlimited
      maxProducts: -1,
      maxInvoicesPerMonth: -1,
      maxStorageMB: 50000,
    },
    features: {
      basicInventory: true,
      basicInvoicing: true,
      basicReports: true,
      whatsappIntegration: true,
      barcodeScanning: true,
      multiLocation: true,
      apiAccess: true,
      customDomain: true,
      whiteLabel: true,
      advancedAnalytics: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
    },
  },
}
```

### Feature Access Control

```typescript
// src/hooks/useFeatureAccess.ts
import { useTenant } from './useTenant'
import { PLANS } from '@/config/plans'

export function useFeatureAccess(feature: string): boolean {
  const { tenant } = useTenant()

  if (!tenant) return false

  const plan = PLANS[tenant.plan]
  return plan.features[feature] ?? false
}

// Usage in components
function WhatsAppButton({ invoice }) {
  const hasWhatsApp = useFeatureAccess('whatsappIntegration')

  if (!hasWhatsApp) {
    return (
      <Button disabled>
        Upgrade to Professional for WhatsApp
      </Button>
    )
  }

  return <Button onClick={() => sendViaWhatsApp(invoice)}>Send via WhatsApp</Button>
}
```

---

## Phase 9: Data Residency & Compliance

### Regional Supabase Instances

For enterprise clients or regulatory compliance:

```
Region          | Supabase Instance      | Data Residency
----------------|------------------------|------------------
Asia-Pacific    | ap-south-1 (Mumbai)    | India
Middle East     | me-south-1 (Bahrain)   | Middle East
Europe          | eu-west-1 (Ireland)    | EU (GDPR)
UK              | eu-west-2 (London)     | UK
```

### Configuration

```typescript
// src/config/supabase-regions.ts
const SUPABASE_REGIONS = {
  PK: { url: process.env.VITE_SUPABASE_ASIA_URL, key: '...' },
  AE: { url: process.env.VITE_SUPABASE_ME_URL, key: '...' },
  SA: { url: process.env.VITE_SUPABASE_ME_URL, key: '...' },
  GB: { url: process.env.VITE_SUPABASE_EU_URL, key: '...' },
  MY: { url: process.env.VITE_SUPABASE_ASIA_URL, key: '...' },
}

export function getSupabaseClient(countryCode: string) {
  const region = SUPABASE_REGIONS[countryCode] || SUPABASE_REGIONS.PK
  return createClient(region.url, region.key)
}
```

---

## Complete Migration Timeline

### Phase 1: Single-Tenant EVW (Months 0-6)
**Goal**: Launch EVW Pakistan operations
- Build core features for EVW
- EVW-specific branding
- Pakistani business rules
- **Cost**: $70k-100k

### Phase 2: Multi-Tenant Foundation (Months 6-9)
**Goal**: Prepare for multiple customers
- Add `tenant_id` to all tables
- Implement RLS policies
- Build tenant management
- Create subscription plans
- **Cost**: $20k-30k

### Phase 3: Multi-Currency & i18n (Months 9-11)
**Goal**: Support international markets
- Currency conversion
- Multi-language support
- Regional tax rules
- **Cost**: $15k-20k

### Phase 4: Industry Templates (Months 11-13)
**Goal**: Expand beyond vape
- Perfume template
- Cosmetics template
- Supplements template
- **Cost**: $10k-15k per template

### Phase 5: SaaS Launch (Month 14+)
**Goal**: Public SaaS platform
- Self-service signup
- Stripe billing
- Marketing site
- **Cost**: $30k-50k

**Total Investment**: $145k-215k over 14-18 months

---

## Success Metrics

### Technical KPIs
- Support 1000+ tenants on shared infrastructure
- < 2 second page load globally
- 99.9% uptime SLA
- < 200ms API response time (p95)

### Business KPIs
- 100+ paying customers by Month 18
- $10k+ MRR (Monthly Recurring Revenue)
- < 5% churn rate
- 40%+ gross margin

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: Strategic Blueprint for SaaS Transformation
