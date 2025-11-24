# EVW Cloud ERP - Complete Database Schema

## Database Design Philosophy

- **Normalization**: 3NF (Third Normal Form) to reduce redundancy
- **Audit Trail**: Track all changes with created_at, updated_at, deleted_at
- **Soft Deletes**: Use deleted_at for data recovery
- **UUID Primary Keys**: Better for distributed systems and security
- **Indexed Fields**: Performance optimization on frequently queried columns
- **Row Level Security (RLS)**: Supabase RLS for multi-tenant future

## Entity Relationship Diagram (ERD)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │────────>│   invoices   │<────────│  customers   │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                         │
       │                        │                         │
       │                        ▼                         │
       │                 ┌──────────────┐                 │
       │                 │invoice_items │                 │
       │                 └──────────────┘                 │
       │                        │                         │
       │                        │                         │
       │                        ▼                         │
       │                 ┌──────────────┐                 │
       └────────────────>│   products   │<────────────────┘
                         └──────────────┘
                                │
                                │
                                ▼
                         ┌──────────────┐
                         │  stock_logs  │
                         └──────────────┘
                                │
                                │
       ┌────────────────────────┴────────────────────────┐
       │                                                  │
       ▼                                                  ▼
┌──────────────┐                                  ┌──────────────┐
│   expenses   │                                  │   payments   │
└──────────────┘                                  └──────────────┘
       │                                                  │
       │                                                  │
       ▼                                                  ▼
┌──────────────┐                                  ┌──────────────┐
│ audit_logs   │──────────────────────────────────│customer_tags │
└──────────────┘                                  └──────────────┘
```

## Core Tables

### 1. users (Authentication & Authorization)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
    -- Roles: SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER
  permissions JSONB DEFAULT '[]'::jsonb,
    -- Granular permissions array
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip VARCHAR(45),
  two_fa_enabled BOOLEAN DEFAULT false,
  two_fa_secret TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_role CHECK (role IN (
    'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'
  ))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

### 2. products (Inventory Items)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
    -- Categories: E-Liquid, Pod System, Disposable, Coil, Battery, Accessory
  flavor VARCHAR(100),
  strength VARCHAR(50),
    -- e.g., '0mg', '3mg', '6mg', '12mg', '18mg', '50mg' for salt nic
  description TEXT,

  -- Pricing
  cost_price DECIMAL(10, 2) NOT NULL,
    -- Purchase price from supplier
  retail_price DECIMAL(10, 2) NOT NULL,
    -- Price for retail customers
  wholesale_price DECIMAL(10, 2) NOT NULL,
    -- Price for wholesale customers

  -- Stock Management
  current_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,

  -- Product Details
  barcode VARCHAR(100) UNIQUE,
  qr_code TEXT,
    -- Generated QR code data
  weight_grams DECIMAL(8, 2),
  dimensions VARCHAR(100),
    -- e.g., "10x5x3 cm"

  -- Supplier & Batch Info
  supplier_id UUID REFERENCES suppliers(id),
  batch_number VARCHAR(100),
  expiry_date DATE,
  manufacturing_date DATE,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  image_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT positive_prices CHECK (
    cost_price >= 0 AND
    retail_price >= cost_price AND
    wholesale_price >= cost_price
  ),
  CONSTRAINT valid_stock CHECK (current_stock >= 0)
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_current_stock ON products(current_stock);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);
CREATE INDEX idx_products_low_stock ON products(current_stock, low_stock_threshold)
  WHERE current_stock <= low_stock_threshold;

-- Full-text search index
CREATE INDEX idx_products_search ON products
  USING gin(to_tsvector('english', name || ' ' || brand || ' ' || flavor));
```

### 3. customers

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  customer_type VARCHAR(50) NOT NULL DEFAULT 'RETAIL',
    -- Types: RETAIL, WHOLESALE, DISTRIBUTOR

  -- Contact Information
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  email VARCHAR(255),
  whatsapp_number VARCHAR(20),

  -- Address
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Pakistan',

  -- Financial
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,
    -- Positive = customer owes us, Negative = we owe customer
  total_purchases DECIMAL(15, 2) DEFAULT 0,
    -- Lifetime value

  -- Business Details (for wholesale)
  ntn_number VARCHAR(50),
    -- National Tax Number (Pakistan)
  strn_number VARCHAR(50),
    -- Sales Tax Registration Number
  cnic VARCHAR(20),
    -- Computerized National Identity Card

  -- Tags and Notes
  tags JSONB DEFAULT '[]'::jsonb,
    -- e.g., ["VIP", "Bulk Buyer", "Late Payer", "Preferred"]
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_customer_type CHECK (customer_type IN (
    'RETAIL', 'WHOLESALE', 'DISTRIBUTOR'
  )),
  CONSTRAINT valid_balance CHECK (current_balance <= credit_limit OR credit_limit = 0)
);

-- Indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_tags ON customers USING gin(tags);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
```

### 4. invoices

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
    -- Sequential: EVW-2025-00001

  -- Customer Info
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
    -- Denormalized for walk-in customers
  customer_phone VARCHAR(20),

  -- Invoice Details
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,

  -- Pricing
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
    -- GST/Sales Tax if applicable
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,

  -- Profit Calculation
  total_cost DECIMAL(12, 2) NOT NULL,
    -- Sum of cost prices * quantities
  total_profit DECIMAL(12, 2) NOT NULL,
    -- total_amount - total_cost
  profit_margin_percentage DECIMAL(5, 2),
    -- (total_profit / total_amount) * 100

  -- Payment Status
  status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    -- PAID, PARTIAL, UNPAID, CANCELLED, REFUNDED
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2),
    -- total_amount - paid_amount

  -- Payment Method (primary payment)
  payment_method VARCHAR(50),
    -- CASH, BANK_TRANSFER, JAZZCASH, EASYPAISA, CARD, CREDIT

  -- Invoice Type
  invoice_type VARCHAR(50) DEFAULT 'SALES',
    -- SALES, RETURN, CREDIT_NOTE

  -- Notes
  notes TEXT,
  internal_notes TEXT,
    -- Not visible to customer

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_status CHECK (status IN (
    'PAID', 'PARTIAL', 'UNPAID', 'CANCELLED', 'REFUNDED'
  )),
  CONSTRAINT valid_invoice_type CHECK (invoice_type IN (
    'SALES', 'RETURN', 'CREDIT_NOTE'
  )),
  CONSTRAINT valid_amounts CHECK (
    subtotal >= 0 AND
    total_amount >= 0 AND
    paid_amount >= 0 AND
    paid_amount <= total_amount
  )
);

-- Indexes
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status != 'PAID';
```

### 5. invoice_items (Line Items)

```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),

  -- Product Details (denormalized for historical record)
  product_sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_brand VARCHAR(100),
  product_category VARCHAR(100),

  -- Pricing
  cost_price DECIMAL(10, 2) NOT NULL,
    -- Cost at time of sale
  unit_price DECIMAL(10, 2) NOT NULL,
    -- Selling price (retail or wholesale)
  price_type VARCHAR(50) NOT NULL,
    -- RETAIL, WHOLESALE, CUSTOM

  -- Quantity
  quantity INTEGER NOT NULL,

  -- Calculations
  line_subtotal DECIMAL(12, 2) NOT NULL,
    -- unit_price * quantity
  line_discount DECIMAL(12, 2) DEFAULT 0,
  line_total DECIMAL(12, 2) NOT NULL,
    -- line_subtotal - line_discount

  -- Profit
  line_cost DECIMAL(12, 2) NOT NULL,
    -- cost_price * quantity
  line_profit DECIMAL(12, 2) NOT NULL,
    -- line_total - line_cost
  line_profit_margin DECIMAL(5, 2),
    -- (line_profit / line_total) * 100

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_prices CHECK (
    cost_price >= 0 AND
    unit_price >= 0 AND
    line_total >= 0
  ),
  CONSTRAINT valid_price_type CHECK (price_type IN (
    'RETAIL', 'WHOLESALE', 'CUSTOM'
  ))
);

-- Indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX idx_invoice_items_product_sku ON invoice_items(product_sku);
```

### 6. payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number VARCHAR(50) UNIQUE NOT NULL,
    -- e.g., PAY-2025-00001

  -- References
  invoice_id UUID REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),

  -- Payment Details
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
    -- CASH, BANK_TRANSFER, JAZZCASH, EASYPAISA, CARD, CHEQUE

  -- Payment Method Specific Details
  transaction_id VARCHAR(255),
    -- For digital payments
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  cheque_number VARCHAR(50),
  cheque_date DATE,

  -- Status
  status VARCHAR(50) DEFAULT 'COMPLETED',
    -- PENDING, COMPLETED, FAILED, CANCELLED

  -- Notes
  notes TEXT,

  -- Receipt
  receipt_url TEXT,
    -- Link to uploaded receipt image

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_payment_method CHECK (payment_method IN (
    'CASH', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'CARD', 'CHEQUE', 'CREDIT'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'
  ))
);

-- Indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_status ON payments(status);
```

### 7. stock_logs (Inventory Movement)

```sql
CREATE TABLE stock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Product Details (denormalized)
  product_sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,

  -- Stock Movement
  change_type VARCHAR(50) NOT NULL,
    -- IN, OUT, ADJUSTMENT, DAMAGE, THEFT, RETURN, TRANSFER
  change_amount INTEGER NOT NULL,
    -- Positive for IN, Negative for OUT
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,

  -- Reason & Reference
  reason VARCHAR(100) NOT NULL,
    -- RESTOCK, SALE, DAMAGE, THEFT, CORRECTION, CUSTOMER_RETURN, SUPPLIER_RETURN
  reference_type VARCHAR(50),
    -- INVOICE, PURCHASE_ORDER, STOCK_AUDIT, MANUAL
  reference_id UUID,
    -- ID of related invoice, PO, etc.

  -- Details
  notes TEXT,
  batch_number VARCHAR(100),

  -- Location (for multi-warehouse future)
  location VARCHAR(100) DEFAULT 'Main Warehouse',

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_change_type CHECK (change_type IN (
    'IN', 'OUT', 'ADJUSTMENT', 'DAMAGE', 'THEFT', 'RETURN', 'TRANSFER'
  )),
  CONSTRAINT valid_reason CHECK (reason IN (
    'RESTOCK', 'SALE', 'DAMAGE', 'THEFT', 'CORRECTION',
    'CUSTOMER_RETURN', 'SUPPLIER_RETURN', 'EXPIRED', 'LOST'
  )),
  CONSTRAINT valid_stock CHECK (new_stock >= 0)
);

-- Indexes
CREATE INDEX idx_stock_logs_product_id ON stock_logs(product_id);
CREATE INDEX idx_stock_logs_change_type ON stock_logs(change_type);
CREATE INDEX idx_stock_logs_created_at ON stock_logs(created_at DESC);
CREATE INDEX idx_stock_logs_reference ON stock_logs(reference_type, reference_id);
```

### 8. expenses

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_number VARCHAR(50) UNIQUE NOT NULL,
    -- e.g., EXP-2025-00001

  -- Expense Details
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL,
    -- Rent, Utilities, Salary, Restocking, Maintenance, Marketing, Transportation, Other
  sub_category VARCHAR(100),
  amount DECIMAL(12, 2) NOT NULL,

  -- Payment Details
  payment_method VARCHAR(50) NOT NULL,
    -- CASH, BANK_TRANSFER, CHEQUE, CARD, OTHER
  paid_to VARCHAR(255),
    -- Vendor/supplier name

  -- Description
  description TEXT NOT NULL,
  notes TEXT,

  -- Receipt
  receipt_url TEXT,
    -- Link to uploaded receipt image

  -- Status
  status VARCHAR(50) DEFAULT 'PAID',
    -- PAID, PENDING, CANCELLED

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_payment_method CHECK (payment_method IN (
    'CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'PAID', 'PENDING', 'CANCELLED'
  ))
);

-- Indexes
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_payment_method ON expenses(payment_method);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
CREATE INDEX idx_expenses_deleted_at ON expenses(deleted_at);
```

### 9. suppliers

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),

  -- Contact Information
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  email VARCHAR(255),

  -- Address
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Pakistan',

  -- Financial
  current_balance DECIMAL(12, 2) DEFAULT 0,
    -- Positive = we owe them, Negative = they owe us
  total_purchases DECIMAL(15, 2) DEFAULT 0,

  -- Business Details
  ntn_number VARCHAR(50),
  strn_number VARCHAR(50),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_phone ON suppliers(phone);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
```

### 10. purchase_orders

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
    -- e.g., PO-2025-00001

  -- Supplier
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name VARCHAR(255) NOT NULL,

  -- Order Details
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,

  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, SENT, CONFIRMED, PARTIAL_RECEIVED, RECEIVED, CANCELLED

  -- Payment
  payment_status VARCHAR(50) DEFAULT 'UNPAID',
    -- PAID, PARTIAL, UNPAID
  paid_amount DECIMAL(12, 2) DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN (
    'DRAFT', 'SENT', 'CONFIRMED', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED'
  )),
  CONSTRAINT valid_payment_status CHECK (payment_status IN (
    'PAID', 'PARTIAL', 'UNPAID'
  ))
);

-- Indexes
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date DESC);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
```

### 11. purchase_order_items

```sql
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),

  -- Product Details
  product_sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,

  -- Order Details
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_quantity CHECK (
    quantity_ordered > 0 AND
    quantity_received >= 0 AND
    quantity_received <= quantity_ordered
  )
);

-- Indexes
CREATE INDEX idx_po_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product_id ON purchase_order_items(product_id);
```

### 12. stock_audits

```sql
CREATE TABLE stock_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_number VARCHAR(50) UNIQUE NOT NULL,
    -- e.g., AUDIT-2025-00001

  -- Audit Details
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  audit_type VARCHAR(50) NOT NULL,
    -- FULL, PARTIAL, CYCLE_COUNT

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

  -- Results
  total_items_counted INTEGER DEFAULT 0,
  total_discrepancies INTEGER DEFAULT 0,
  total_variance_value DECIMAL(12, 2) DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_audit_type CHECK (audit_type IN (
    'FULL', 'PARTIAL', 'CYCLE_COUNT'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  ))
);

-- Indexes
CREATE INDEX idx_stock_audits_audit_date ON stock_audits(audit_date DESC);
CREATE INDEX idx_stock_audits_status ON stock_audits(status);
```

### 13. stock_audit_items

```sql
CREATE TABLE stock_audit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_audit_id UUID NOT NULL REFERENCES stock_audits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),

  -- Product Details
  product_sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,

  -- Counts
  system_count INTEGER NOT NULL,
    -- Stock according to system
  physical_count INTEGER,
    -- Actual counted stock
  variance INTEGER,
    -- physical_count - system_count

  -- Valuation
  unit_cost DECIMAL(10, 2) NOT NULL,
  variance_value DECIMAL(12, 2),
    -- variance * unit_cost

  -- Status
  status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, COUNTED, ADJUSTED, ISSUE

  -- Notes
  notes TEXT,

  -- Metadata
  counted_by UUID REFERENCES users(id),
  counted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN (
    'PENDING', 'COUNTED', 'ADJUSTED', 'ISSUE'
  ))
);

-- Indexes
CREATE INDEX idx_audit_items_audit_id ON stock_audit_items(stock_audit_id);
CREATE INDEX idx_audit_items_product_id ON stock_audit_items(product_id);
CREATE INDEX idx_audit_items_status ON stock_audit_items(status);
```

### 14. audit_logs (User Activity Tracking)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Info
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  user_role VARCHAR(50),

  -- Action Details
  action VARCHAR(100) NOT NULL,
    -- LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, EXPORT, etc.
  entity_type VARCHAR(100),
    -- PRODUCT, INVOICE, CUSTOMER, USER, etc.
  entity_id UUID,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,

  -- Metadata
  description TEXT,
  severity VARCHAR(20) DEFAULT 'INFO',
    -- INFO, WARNING, ERROR, CRITICAL

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_severity CHECK (severity IN (
    'INFO', 'WARNING', 'ERROR', 'CRITICAL'
  ))
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
```

### 15. company_settings

```sql
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Company Information
  company_name VARCHAR(255) NOT NULL DEFAULT 'EVW',
  tagline VARCHAR(255),
  logo_url TEXT,

  -- Contact Details
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Address
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Pakistan',

  -- Business Details
  ntn_number VARCHAR(50),
  strn_number VARCHAR(50),

  -- Bank Details (for invoices)
  bank_details JSONB DEFAULT '[]'::jsonb,
    -- Array of bank accounts with name, account number, IBAN, branch

  -- Invoice Settings
  invoice_prefix VARCHAR(20) DEFAULT 'EVW',
  next_invoice_number INTEGER DEFAULT 1,
  invoice_terms TEXT,
  invoice_footer TEXT,

  -- Tax Settings
  default_tax_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_registration_number VARCHAR(100),

  -- Currency
  currency_code VARCHAR(10) DEFAULT 'PKR',
  currency_symbol VARCHAR(10) DEFAULT 'Rs.',

  -- System Settings
  low_stock_alert_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT false,
  whatsapp_notifications_enabled BOOLEAN DEFAULT false,

  -- Metadata
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one row should exist
CREATE UNIQUE INDEX idx_company_settings_singleton ON company_settings ((id IS NOT NULL));
```

### 16. notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipient
  user_id UUID REFERENCES users(id),

  -- Notification Details
  type VARCHAR(50) NOT NULL,
    -- LOW_STOCK, PAYMENT_DUE, PAYMENT_RECEIVED, ORDER_PLACED, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Related Entity
  entity_type VARCHAR(100),
  entity_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 17. customer_tags

```sql
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(20) DEFAULT '#3B82F6',
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Common tags to insert
INSERT INTO customer_tags (name, color, description) VALUES
  ('VIP', '#FFD700', 'High-value customer'),
  ('Bulk Buyer', '#10B981', 'Purchases in large quantities'),
  ('Late Payer', '#EF4444', 'History of late payments'),
  ('Preferred', '#8B5CF6', 'Preferred customer status'),
  ('Distributor', '#3B82F6', 'Authorized distributor'),
  ('New Customer', '#06B6D4', 'Recently onboarded');
```

### 18. whatsapp_messages (Optional)

```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipient
  customer_id UUID REFERENCES customers(id),
  phone_number VARCHAR(20) NOT NULL,

  -- Message Details
  message_type VARCHAR(50) NOT NULL,
    -- INVOICE, PAYMENT_REMINDER, ORDER_CONFIRMATION, CUSTOM
  message_body TEXT NOT NULL,

  -- Attachments
  attachment_url TEXT,
  attachment_type VARCHAR(50),
    -- PDF, IMAGE, DOCUMENT

  -- Related Entity
  entity_type VARCHAR(100),
  entity_id UUID,

  -- Status
  status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, SENT, DELIVERED, FAILED
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_message_type CHECK (message_type IN (
    'INVOICE', 'PAYMENT_REMINDER', 'ORDER_CONFIRMATION', 'CUSTOM'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'PENDING', 'SENT', 'DELIVERED', 'FAILED'
  ))
);

-- Indexes
CREATE INDEX idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);
```

## Database Functions & Triggers

### 1. Auto-update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... apply to all tables with updated_at
```

### 2. Generate Sequential Invoice Numbers

```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
  year_part TEXT;
BEGIN
  SELECT invoice_prefix, next_invoice_number
  INTO prefix, next_num
  FROM company_settings
  LIMIT 1;

  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  UPDATE company_settings
  SET next_invoice_number = next_invoice_number + 1;

  RETURN prefix || '-' || year_part || '-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
BEFORE INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION set_invoice_number();
```

### 3. Auto-update Customer Balance

```sql
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customers
    SET current_balance = current_balance + NEW.remaining_amount,
        total_purchases = total_purchases + NEW.total_amount
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE customers
    SET current_balance = current_balance - OLD.remaining_amount + NEW.remaining_amount
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customers
    SET current_balance = current_balance - OLD.remaining_amount,
        total_purchases = total_purchases - OLD.total_amount
    WHERE id = OLD.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_customer_balance();
```

### 4. Auto-update Product Stock from Invoice

```sql
CREATE OR REPLACE FUNCTION update_product_stock_from_invoice()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;

    -- Create stock log
    INSERT INTO stock_logs (
      product_id, product_sku, product_name,
      change_type, change_amount, previous_stock, new_stock,
      reason, reference_type, reference_id, created_by
    )
    SELECT
      p.id, p.sku, p.name,
      'OUT', -NEW.quantity, p.current_stock + NEW.quantity, p.current_stock,
      'SALE', 'INVOICE', NEW.invoice_id,
      (SELECT created_by FROM invoices WHERE id = NEW.invoice_id)
    FROM products p
    WHERE p.id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_stock_trigger
AFTER INSERT ON invoice_items
FOR EACH ROW EXECUTE FUNCTION update_product_stock_from_invoice();
```

### 5. Send Low Stock Notifications

```sql
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= NEW.low_stock_threshold THEN
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
    SELECT
      u.id,
      'LOW_STOCK',
      'Low Stock Alert',
      'Product "' || NEW.name || '" (SKU: ' || NEW.sku || ') is running low. Current stock: ' || NEW.current_stock,
      'PRODUCT',
      NEW.id
    FROM users u
    WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
      AND u.is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_low_stock_trigger
AFTER UPDATE OF current_stock ON products
FOR EACH ROW EXECUTE FUNCTION check_low_stock();
```

## Database Views (Reporting)

### 1. Sales Summary View

```sql
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT
  DATE_TRUNC('day', invoice_date) AS sale_date,
  COUNT(*) AS total_invoices,
  SUM(total_amount) AS total_sales,
  SUM(total_profit) AS total_profit,
  AVG(total_amount) AS average_invoice_value,
  SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) AS paid_amount,
  SUM(CASE WHEN status = 'UNPAID' THEN total_amount ELSE 0 END) AS unpaid_amount
FROM invoices
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', invoice_date)
ORDER BY sale_date DESC;
```

### 2. Top Selling Products View

```sql
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT
  p.id,
  p.sku,
  p.name,
  p.brand,
  p.category,
  COUNT(ii.id) AS times_sold,
  SUM(ii.quantity) AS total_quantity_sold,
  SUM(ii.line_total) AS total_revenue,
  SUM(ii.line_profit) AS total_profit
FROM products p
LEFT JOIN invoice_items ii ON p.id = ii.product_id
LEFT JOIN invoices i ON ii.invoice_id = i.id
WHERE i.deleted_at IS NULL
GROUP BY p.id, p.sku, p.name, p.brand, p.category
ORDER BY total_quantity_sold DESC;
```

### 3. Customer Ledger View

```sql
CREATE OR REPLACE VIEW v_customer_ledger AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  c.customer_type,
  c.credit_limit,
  c.current_balance,
  c.total_purchases,
  COUNT(DISTINCT i.id) AS total_invoices,
  SUM(i.total_amount) AS total_invoice_amount,
  SUM(i.paid_amount) AS total_paid,
  SUM(i.remaining_amount) AS total_outstanding
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id AND i.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.customer_type, c.credit_limit, c.current_balance, c.total_purchases
ORDER BY total_outstanding DESC;
```

### 4. Inventory Valuation View

```sql
CREATE OR REPLACE VIEW v_inventory_valuation AS
SELECT
  p.id,
  p.sku,
  p.name,
  p.brand,
  p.category,
  p.current_stock,
  p.cost_price,
  p.retail_price,
  p.wholesale_price,
  (p.current_stock * p.cost_price) AS stock_value_at_cost,
  (p.current_stock * p.retail_price) AS stock_value_at_retail,
  CASE
    WHEN p.current_stock <= p.low_stock_threshold THEN 'LOW'
    WHEN p.current_stock = 0 THEN 'OUT_OF_STOCK'
    ELSE 'NORMAL'
  END AS stock_status
FROM products p
WHERE p.deleted_at IS NULL AND p.is_active = true
ORDER BY stock_value_at_cost DESC;
```

### 5. Profit & Loss View

```sql
CREATE OR REPLACE VIEW v_profit_loss AS
SELECT
  DATE_TRUNC('month', date_col) AS period,
  SUM(revenue) AS total_revenue,
  SUM(cogs) AS total_cogs,
  SUM(revenue - cogs) AS gross_profit,
  SUM(expenses) AS total_expenses,
  SUM(revenue - cogs - expenses) AS net_profit
FROM (
  -- Revenue and COGS from invoices
  SELECT
    invoice_date AS date_col,
    total_amount AS revenue,
    total_cost AS cogs,
    0 AS expenses
  FROM invoices
  WHERE deleted_at IS NULL AND status != 'CANCELLED'

  UNION ALL

  -- Expenses
  SELECT
    expense_date AS date_col,
    0 AS revenue,
    0 AS cogs,
    amount AS expenses
  FROM expenses
  WHERE deleted_at IS NULL AND status = 'PAID'
) combined
GROUP BY DATE_TRUNC('month', date_col)
ORDER BY period DESC;
```

## Seeding Data

### Initial Admin User

```sql
-- Note: In production, hash passwords properly using bcrypt
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@evw.pk',
  '$2a$10$encrypted_password_hash_here',
  'EVW Administrator',
  'SUPER_ADMIN',
  true
);
```

### Company Settings

```sql
INSERT INTO company_settings (
  company_name,
  tagline,
  phone,
  email,
  address,
  city,
  province,
  country,
  bank_details,
  invoice_terms
) VALUES (
  'EVW',
  'Premium Vape Wholesale & Retail',
  '+92-XXX-XXXXXXX',
  'info@evw.pk',
  'Your Address Here',
  'Karachi',
  'Sindh',
  'Pakistan',
  '[
    {
      "bank_name": "Allied Bank Limited",
      "account_title": "EVW",
      "account_number": "XXXX-XXXX-XXXX",
      "iban": "PK##XXXX################",
      "branch": "Main Branch, Karachi"
    }
  ]'::jsonb,
  'Payment due within 30 days. Late payments may incur additional charges.'
);
```

## Backup & Maintenance Scripts

### Daily Backup Script

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/evw-erp"
DB_NAME="evw_cloud_erp"

# Create backup
pg_dump $DB_NAME | gzip > "$BACKUP_DIR/evw_db_$DATE.sql.gz"

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR/evw_db_$DATE.sql.gz" s3://evw-backups/database/

# Keep only last 30 days of local backups
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Database Statistics Query

```sql
-- Get table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Database Engine**: PostgreSQL 15+
**Status**: Ready for Implementation
