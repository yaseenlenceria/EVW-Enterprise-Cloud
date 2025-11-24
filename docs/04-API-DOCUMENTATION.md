# EVW Cloud ERP - API Documentation

## API Overview

### Base Information
- **Base URL**: `https://your-project.supabase.co`
- **API Type**: REST + Supabase Auto-generated API + Edge Functions
- **Authentication**: JWT Bearer tokens (Supabase Auth)
- **Content-Type**: `application/json`
- **Rate Limit**: 1000 requests/hour per user

### Authentication

All API requests require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Response Format

**Success Response:**
```json
{
  "data": { ...response data... },
  "error": null,
  "status": 200
}
```

**Error Response:**
```json
{
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ...additional details... }
  },
  "status": 400
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## 1. Authentication API

### POST /auth/signup
Register a new user (admin only).

**Request:**
```json
{
  "email": "user@evw.pk",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+92-XXX-XXXXXXX",
  "role": "STAFF"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@evw.pk",
      "full_name": "John Doe",
      "role": "STAFF",
      "created_at": "2025-01-24T10:00:00Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "...",
      "expires_in": 3600
    }
  }
}
```

---

### POST /auth/login
User login.

**Request:**
```json
{
  "email": "user@evw.pk",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@evw.pk",
      "full_name": "John Doe",
      "role": "STAFF",
      "permissions": ["view_products", "create_invoices"]
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "...",
      "expires_in": 3600,
      "expires_at": "2025-01-24T11:00:00Z"
    }
  }
}
```

---

### POST /auth/logout
User logout.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "..."
}
```

**Response:**
```json
{
  "data": {
    "access_token": "new_token",
    "expires_in": 3600
  }
}
```

---

### POST /auth/reset-password
Request password reset.

**Request:**
```json
{
  "email": "user@evw.pk"
}
```

**Response:**
```json
{
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

## 2. Users API

### GET /api/users
Get all users (admin only).

**Query Parameters:**
- `role` - Filter by role (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER)
- `is_active` - Filter by active status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by name or email

**Example:**
```
GET /api/users?role=STAFF&is_active=true&page=1&limit=20
```

**Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "staff@evw.pk",
        "full_name": "Staff Member",
        "phone": "+92-XXX-XXXXXXX",
        "role": "STAFF",
        "is_active": true,
        "last_login_at": "2025-01-24T09:30:00Z",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

### GET /api/users/:id
Get user by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "email": "staff@evw.pk",
    "full_name": "Staff Member",
    "phone": "+92-XXX-XXXXXXX",
    "role": "STAFF",
    "permissions": ["view_products", "create_invoices"],
    "is_active": true,
    "profile_image_url": "https://...",
    "last_login_at": "2025-01-24T09:30:00Z",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### PATCH /api/users/:id
Update user.

**Request:**
```json
{
  "full_name": "Updated Name",
  "phone": "+92-XXX-XXXXXXX",
  "role": "MANAGER",
  "permissions": ["view_products", "create_invoices", "manage_inventory"],
  "is_active": true
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "email": "staff@evw.pk",
    "full_name": "Updated Name",
    "role": "MANAGER",
    "updated_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### DELETE /api/users/:id
Soft delete user (admin only).

**Response:**
```json
{
  "data": {
    "message": "User deleted successfully",
    "deleted_at": "2025-01-24T10:00:00Z"
  }
}
```

---

## 3. Products API

### GET /api/products
Get all products.

**Query Parameters:**
- `category` - Filter by category
- `brand` - Filter by brand
- `is_active` - Filter by active status
- `low_stock` - Filter low stock items (true/false)
- `search` - Search by name, SKU, or flavor
- `page` - Page number
- `limit` - Items per page
- `sort` - Sort field (name, sku, stock, created_at)
- `order` - Sort order (asc, desc)

**Example:**
```
GET /api/products?category=E-Liquid&low_stock=true&sort=current_stock&order=asc
```

**Response:**
```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "EL-NASTY-STRAW-50MG",
        "name": "Nasty Juice - Strawberry",
        "brand": "Nasty Juice",
        "category": "E-Liquid",
        "flavor": "Strawberry",
        "strength": "50mg",
        "cost_price": 800,
        "retail_price": 1200,
        "wholesale_price": 1000,
        "current_stock": 5,
        "low_stock_threshold": 10,
        "barcode": "1234567890123",
        "image_url": "https://...",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

---

### GET /api/products/:id
Get product by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "sku": "EL-NASTY-STRAW-50MG",
    "name": "Nasty Juice - Strawberry",
    "brand": "Nasty Juice",
    "category": "E-Liquid",
    "flavor": "Strawberry",
    "strength": "50mg",
    "description": "Premium Malaysian e-liquid",
    "cost_price": 800,
    "retail_price": 1200,
    "wholesale_price": 1000,
    "current_stock": 5,
    "low_stock_threshold": 10,
    "reorder_quantity": 50,
    "barcode": "1234567890123",
    "qr_code": "data:image/png;base64,...",
    "image_url": "https://...",
    "supplier": {
      "id": "uuid",
      "name": "Premium Vape Imports"
    },
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-20T00:00:00Z"
  }
}
```

---

### POST /api/products
Create new product.

**Request:**
```json
{
  "sku": "EL-NASTY-MANGO-50MG",
  "name": "Nasty Juice - Mango",
  "brand": "Nasty Juice",
  "category": "E-Liquid",
  "flavor": "Mango",
  "strength": "50mg",
  "description": "Tropical mango flavor",
  "cost_price": 800,
  "retail_price": 1200,
  "wholesale_price": 1000,
  "current_stock": 100,
  "low_stock_threshold": 10,
  "reorder_quantity": 50,
  "supplier_id": "uuid",
  "barcode": "1234567890124",
  "is_active": true
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "sku": "EL-NASTY-MANGO-50MG",
    "name": "Nasty Juice - Mango",
    "qr_code": "auto-generated",
    "created_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### PATCH /api/products/:id
Update product.

**Request:**
```json
{
  "retail_price": 1300,
  "wholesale_price": 1100,
  "current_stock": 95,
  "low_stock_threshold": 15
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "sku": "EL-NASTY-MANGO-50MG",
    "retail_price": 1300,
    "wholesale_price": 1100,
    "current_stock": 95,
    "updated_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### DELETE /api/products/:id
Soft delete product.

**Response:**
```json
{
  "data": {
    "message": "Product deleted successfully",
    "deleted_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### POST /api/products/:id/adjust-stock
Adjust product stock manually.

**Request:**
```json
{
  "change_amount": -10,
  "reason": "DAMAGE",
  "notes": "Damaged during transport"
}
```

**Response:**
```json
{
  "data": {
    "product_id": "uuid",
    "previous_stock": 95,
    "new_stock": 85,
    "change_amount": -10,
    "stock_log_id": "uuid"
  }
}
```

---

### GET /api/products/low-stock
Get low stock products.

**Response:**
```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "EL-NASTY-STRAW-50MG",
        "name": "Nasty Juice - Strawberry",
        "current_stock": 5,
        "low_stock_threshold": 10,
        "reorder_quantity": 50,
        "stock_value": 4000
      }
    ],
    "total_items": 12,
    "total_value": 48000
  }
}
```

---

## 4. Customers API

### GET /api/customers
Get all customers.

**Query Parameters:**
- `type` - Filter by type (RETAIL, WHOLESALE, DISTRIBUTOR)
- `is_active` - Filter by active status
- `has_balance` - Filter customers with outstanding balance
- `tags` - Filter by tags (comma-separated)
- `search` - Search by name, phone, or email
- `page` - Page number
- `limit` - Items per page

**Example:**
```
GET /api/customers?type=WHOLESALE&has_balance=true&search=Ali
```

**Response:**
```json
{
  "data": {
    "customers": [
      {
        "id": "uuid",
        "name": "Ali Vape Shop",
        "business_name": "Ali Traders",
        "customer_type": "WHOLESALE",
        "phone": "+92-300-1234567",
        "email": "ali@vape.pk",
        "city": "Karachi",
        "credit_limit": 100000,
        "current_balance": 25000,
        "total_purchases": 500000,
        "tags": ["VIP", "Bulk Buyer"],
        "is_active": true,
        "created_at": "2024-06-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "total_pages": 5
    }
  }
}
```

---

### GET /api/customers/:id
Get customer by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Ali Vape Shop",
    "business_name": "Ali Traders",
    "customer_type": "WHOLESALE",
    "phone": "+92-300-1234567",
    "alternate_phone": "+92-300-7654321",
    "email": "ali@vape.pk",
    "whatsapp_number": "+92-300-1234567",
    "address": "Shop #12, Main Market",
    "city": "Karachi",
    "province": "Sindh",
    "country": "Pakistan",
    "credit_limit": 100000,
    "current_balance": 25000,
    "total_purchases": 500000,
    "ntn_number": "1234567-8",
    "tags": ["VIP", "Bulk Buyer"],
    "notes": "Prefers WhatsApp communication",
    "is_active": true,
    "created_at": "2024-06-01T00:00:00Z",
    "recent_invoices": [
      {
        "id": "uuid",
        "invoice_number": "EVW-2025-00123",
        "date": "2025-01-20",
        "total": 35000,
        "status": "PAID"
      }
    ]
  }
}
```

---

### POST /api/customers
Create new customer.

**Request:**
```json
{
  "name": "New Customer",
  "business_name": "New Vape Store",
  "customer_type": "WHOLESALE",
  "phone": "+92-300-9876543",
  "email": "new@vape.pk",
  "address": "123 Main Street",
  "city": "Lahore",
  "province": "Punjab",
  "credit_limit": 50000,
  "tags": ["New Customer"]
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "New Customer",
    "customer_type": "WHOLESALE",
    "created_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### PATCH /api/customers/:id
Update customer.

**Request:**
```json
{
  "credit_limit": 150000,
  "tags": ["VIP", "Bulk Buyer", "Preferred"],
  "notes": "Increased credit limit due to good payment history"
}
```

---

### GET /api/customers/:id/ledger
Get customer transaction ledger.

**Response:**
```json
{
  "data": {
    "customer": {
      "id": "uuid",
      "name": "Ali Vape Shop",
      "current_balance": 25000
    },
    "transactions": [
      {
        "date": "2025-01-20",
        "type": "INVOICE",
        "reference": "EVW-2025-00123",
        "debit": 35000,
        "credit": 0,
        "balance": 60000
      },
      {
        "date": "2025-01-22",
        "type": "PAYMENT",
        "reference": "PAY-2025-00045",
        "debit": 0,
        "credit": 35000,
        "balance": 25000
      }
    ],
    "summary": {
      "opening_balance": 0,
      "total_invoices": 35000,
      "total_payments": 35000,
      "closing_balance": 25000
    }
  }
}
```

---

## 5. Invoices API

### GET /api/invoices
Get all invoices.

**Query Parameters:**
- `status` - Filter by status (PAID, PARTIAL, UNPAID, CANCELLED)
- `customer_id` - Filter by customer
- `from_date` - Filter from date (YYYY-MM-DD)
- `to_date` - Filter to date
- `payment_method` - Filter by payment method
- `search` - Search by invoice number or customer name
- `page` - Page number
- `limit` - Items per page

**Example:**
```
GET /api/invoices?status=UNPAID&from_date=2025-01-01&to_date=2025-01-31
```

**Response:**
```json
{
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "invoice_number": "EVW-2025-00123",
        "customer_name": "Ali Vape Shop",
        "customer_id": "uuid",
        "invoice_date": "2025-01-20",
        "due_date": "2025-02-20",
        "subtotal": 30000,
        "discount_amount": 1000,
        "tax_amount": 0,
        "total_amount": 29000,
        "total_profit": 5000,
        "profit_margin_percentage": 17.24,
        "status": "UNPAID",
        "paid_amount": 0,
        "remaining_amount": 29000,
        "payment_method": null,
        "created_at": "2025-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 456,
      "total_pages": 23
    },
    "summary": {
      "total_invoices": 456,
      "total_amount": 2500000,
      "total_paid": 1800000,
      "total_unpaid": 700000
    }
  }
}
```

---

### GET /api/invoices/:id
Get invoice by ID with full details.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "invoice_number": "EVW-2025-00123",
    "customer": {
      "id": "uuid",
      "name": "Ali Vape Shop",
      "phone": "+92-300-1234567",
      "address": "Shop #12, Main Market, Karachi"
    },
    "invoice_date": "2025-01-20",
    "due_date": "2025-02-20",
    "items": [
      {
        "id": "uuid",
        "product_sku": "EL-NASTY-STRAW-50MG",
        "product_name": "Nasty Juice - Strawberry",
        "product_brand": "Nasty Juice",
        "quantity": 20,
        "unit_price": 1000,
        "price_type": "WHOLESALE",
        "line_subtotal": 20000,
        "line_discount": 0,
        "line_total": 20000,
        "line_cost": 16000,
        "line_profit": 4000,
        "line_profit_margin": 20
      },
      {
        "id": "uuid",
        "product_sku": "EL-NASTY-MANGO-50MG",
        "product_name": "Nasty Juice - Mango",
        "quantity": 10,
        "unit_price": 1000,
        "price_type": "WHOLESALE",
        "line_total": 10000,
        "line_profit": 2000
      }
    ],
    "subtotal": 30000,
    "discount_percentage": 3.33,
    "discount_amount": 1000,
    "tax_percentage": 0,
    "tax_amount": 0,
    "total_amount": 29000,
    "total_cost": 24000,
    "total_profit": 5000,
    "profit_margin_percentage": 17.24,
    "status": "UNPAID",
    "paid_amount": 0,
    "remaining_amount": 29000,
    "payment_method": null,
    "notes": "Bulk order for shop restocking",
    "created_by": {
      "id": "uuid",
      "name": "Staff Member"
    },
    "created_at": "2025-01-20T10:30:00Z"
  }
}
```

---

### POST /api/invoices
Create new invoice.

**Request:**
```json
{
  "customer_id": "uuid",
  "customer_name": "Ali Vape Shop",
  "customer_phone": "+92-300-1234567",
  "invoice_date": "2025-01-24",
  "due_date": "2025-02-24",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 20,
      "price_type": "WHOLESALE"
    },
    {
      "product_id": "uuid2",
      "quantity": 10,
      "price_type": "WHOLESALE"
    }
  ],
  "discount_percentage": 5,
  "tax_percentage": 0,
  "payment_method": "CASH",
  "paid_amount": 29000,
  "notes": "Paid in full"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "invoice_number": "EVW-2025-00456",
    "total_amount": 29000,
    "total_profit": 5000,
    "status": "PAID",
    "created_at": "2025-01-24T10:00:00Z",
    "pdf_url": "https://storage.supabase.co/invoices/EVW-2025-00456.pdf"
  }
}
```

---

### PATCH /api/invoices/:id
Update invoice (before payment).

**Request:**
```json
{
  "discount_amount": 2000,
  "notes": "Updated discount"
}
```

---

### DELETE /api/invoices/:id
Cancel invoice (soft delete).

**Response:**
```json
{
  "data": {
    "message": "Invoice cancelled successfully",
    "status": "CANCELLED",
    "deleted_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### POST /api/invoices/:id/generate-pdf
Generate PDF for invoice.

**Response:**
```json
{
  "data": {
    "pdf_url": "https://storage.supabase.co/invoices/EVW-2025-00123.pdf",
    "generated_at": "2025-01-24T10:00:00Z"
  }
}
```

---

## 6. Payments API

### GET /api/payments
Get all payments.

**Query Parameters:**
- `invoice_id` - Filter by invoice
- `customer_id` - Filter by customer
- `payment_method` - Filter by method
- `status` - Filter by status
- `from_date` - Filter from date
- `to_date` - Filter to date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": {
    "payments": [
      {
        "id": "uuid",
        "payment_number": "PAY-2025-00045",
        "invoice_id": "uuid",
        "invoice_number": "EVW-2025-00123",
        "customer_name": "Ali Vape Shop",
        "payment_date": "2025-01-22",
        "amount": 29000,
        "payment_method": "BANK_TRANSFER",
        "transaction_id": "TXN12345678",
        "status": "COMPLETED",
        "created_at": "2025-01-22T14:30:00Z"
      }
    ],
    "pagination": {...},
    "summary": {
      "total_payments": 234,
      "total_amount": 1800000
    }
  }
}
```

---

### POST /api/payments
Record a payment.

**Request:**
```json
{
  "invoice_id": "uuid",
  "customer_id": "uuid",
  "payment_date": "2025-01-24",
  "amount": 29000,
  "payment_method": "BANK_TRANSFER",
  "transaction_id": "TXN98765432",
  "bank_name": "Allied Bank",
  "notes": "Full payment received"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "payment_number": "PAY-2025-00067",
    "amount": 29000,
    "invoice_status": "PAID",
    "customer_balance": 0,
    "created_at": "2025-01-24T10:00:00Z"
  }
}
```

---

## 7. Expenses API

### GET /api/expenses
Get all expenses.

**Query Parameters:**
- `category` - Filter by category
- `from_date` - Filter from date
- `to_date` - Filter to date
- `payment_method` - Filter by payment method
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": {
    "expenses": [
      {
        "id": "uuid",
        "expense_number": "EXP-2025-00012",
        "expense_date": "2025-01-15",
        "category": "Rent",
        "amount": 50000,
        "description": "Office rent for January 2025",
        "payment_method": "BANK_TRANSFER",
        "paid_to": "Landlord",
        "status": "PAID",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {...},
    "summary": {
      "total_expenses": 45,
      "total_amount": 350000
    }
  }
}
```

---

### POST /api/expenses
Create new expense.

**Request:**
```json
{
  "expense_date": "2025-01-24",
  "category": "Utilities",
  "sub_category": "Electricity",
  "amount": 15000,
  "description": "Electricity bill for December 2024",
  "payment_method": "BANK_TRANSFER",
  "paid_to": "K-Electric",
  "receipt_url": "https://storage.supabase.co/receipts/receipt123.pdf"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "expense_number": "EXP-2025-00034",
    "amount": 15000,
    "created_at": "2025-01-24T10:00:00Z"
  }
}
```

---

## 8. Stock Logs API

### GET /api/stock-logs
Get stock movement history.

**Query Parameters:**
- `product_id` - Filter by product
- `change_type` - Filter by type (IN, OUT, ADJUSTMENT, etc.)
- `reason` - Filter by reason
- `from_date` - Filter from date
- `to_date` - Filter to date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": {
    "stock_logs": [
      {
        "id": "uuid",
        "product_sku": "EL-NASTY-STRAW-50MG",
        "product_name": "Nasty Juice - Strawberry",
        "change_type": "OUT",
        "change_amount": -20,
        "previous_stock": 100,
        "new_stock": 80,
        "reason": "SALE",
        "reference_type": "INVOICE",
        "reference_id": "uuid",
        "notes": null,
        "created_by": "Staff Member",
        "created_at": "2025-01-20T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 9. Stock Audits API

### GET /api/stock-audits
Get all stock audits.

**Response:**
```json
{
  "data": {
    "audits": [
      {
        "id": "uuid",
        "audit_number": "AUDIT-2025-00001",
        "audit_date": "2025-01-15",
        "audit_type": "FULL",
        "status": "COMPLETED",
        "total_items_counted": 150,
        "total_discrepancies": 12,
        "total_variance_value": -15000,
        "completed_at": "2025-01-15T18:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/stock-audits
Create new stock audit.

**Request:**
```json
{
  "audit_date": "2025-01-24",
  "audit_type": "FULL",
  "notes": "Monthly stock count"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "audit_number": "AUDIT-2025-00002",
    "status": "IN_PROGRESS",
    "items": [
      {
        "product_id": "uuid",
        "product_sku": "EL-NASTY-STRAW-50MG",
        "system_count": 80,
        "physical_count": null,
        "status": "PENDING"
      }
    ]
  }
}
```

---

### PATCH /api/stock-audits/:id/items/:itemId
Update audit item with physical count.

**Request:**
```json
{
  "physical_count": 78,
  "notes": "Found 2 damaged bottles"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "system_count": 80,
    "physical_count": 78,
    "variance": -2,
    "variance_value": -1600,
    "status": "COUNTED"
  }
}
```

---

### POST /api/stock-audits/:id/complete
Complete stock audit and apply adjustments.

**Response:**
```json
{
  "data": {
    "audit_id": "uuid",
    "status": "COMPLETED",
    "total_adjustments": 12,
    "completed_at": "2025-01-24T18:00:00Z"
  }
}
```

---

## 10. Analytics API

### GET /api/analytics/dashboard
Get dashboard statistics.

**Query Parameters:**
- `from_date` - Start date (default: 30 days ago)
- `to_date` - End date (default: today)

**Response:**
```json
{
  "data": {
    "summary": {
      "total_revenue": 2500000,
      "total_profit": 450000,
      "total_expenses": 200000,
      "net_income": 250000,
      "profit_margin": 18,
      "total_invoices": 456,
      "paid_invoices": 380,
      "unpaid_invoices": 76,
      "total_customers": 125,
      "new_customers": 12,
      "low_stock_items": 15,
      "out_of_stock_items": 3,
      "inventory_value": 1500000
    },
    "sales_trend": [
      {
        "date": "2025-01-01",
        "revenue": 45000,
        "profit": 8000,
        "invoices": 12
      },
      // ... 30 days
    ],
    "top_selling_products": [
      {
        "product_name": "Nasty Juice - Strawberry",
        "quantity_sold": 450,
        "revenue": 450000,
        "profit": 90000
      }
    ],
    "top_customers": [
      {
        "customer_name": "Ali Vape Shop",
        "total_purchases": 350000,
        "invoice_count": 25
      }
    ],
    "sales_by_category": [
      {
        "category": "E-Liquid",
        "revenue": 1200000,
        "percentage": 48
      }
    ]
  }
}
```

---

### GET /api/analytics/profit-report
Get detailed profit report.

**Query Parameters:**
- `from_date` - Start date
- `to_date` - End date
- `group_by` - Group by (day, week, month, product, category, brand)

**Response:**
```json
{
  "data": {
    "summary": {
      "total_revenue": 2500000,
      "total_cogs": 2050000,
      "gross_profit": 450000,
      "gross_margin": 18,
      "total_expenses": 200000,
      "net_profit": 250000,
      "net_margin": 10
    },
    "breakdown": [
      {
        "period": "2025-01-01 to 2025-01-31",
        "revenue": 850000,
        "cogs": 690000,
        "gross_profit": 160000,
        "expenses": 65000,
        "net_profit": 95000
      }
    ],
    "by_category": [
      {
        "category": "E-Liquid",
        "revenue": 1200000,
        "profit": 216000,
        "margin": 18
      }
    ],
    "by_product": [
      {
        "product_name": "Nasty Juice - Strawberry",
        "revenue": 450000,
        "profit": 90000,
        "margin": 20
      }
    ]
  }
}
```

---

### GET /api/analytics/inventory-report
Get inventory valuation report.

**Response:**
```json
{
  "data": {
    "summary": {
      "total_products": 150,
      "total_units": 5400,
      "stock_value_at_cost": 1500000,
      "stock_value_at_retail": 2200000,
      "potential_profit": 700000,
      "low_stock_items": 15,
      "out_of_stock_items": 3
    },
    "by_category": [
      {
        "category": "E-Liquid",
        "product_count": 80,
        "total_units": 3200,
        "stock_value": 900000
      }
    ],
    "low_stock_items": [
      {
        "sku": "EL-NASTY-STRAW-50MG",
        "name": "Nasty Juice - Strawberry",
        "current_stock": 5,
        "low_stock_threshold": 10,
        "reorder_quantity": 50,
        "stock_value": 4000
      }
    ]
  }
}
```

---

## 11. Notifications API

### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `is_read` - Filter by read status
- `type` - Filter by type
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "LOW_STOCK",
        "title": "Low Stock Alert",
        "message": "Product 'Nasty Juice - Strawberry' is running low. Current stock: 5",
        "entity_type": "PRODUCT",
        "entity_id": "uuid",
        "is_read": false,
        "created_at": "2025-01-24T09:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

---

### PATCH /api/notifications/:id/read
Mark notification as read.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "is_read": true,
    "read_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### POST /api/notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "data": {
    "marked_read": 5
  }
}
```

---

## 12. WhatsApp Integration API

### POST /api/whatsapp/send-invoice
Send invoice via WhatsApp.

**Request:**
```json
{
  "invoice_id": "uuid",
  "phone_number": "+92-300-1234567",
  "include_pdf": true
}
```

**Response:**
```json
{
  "data": {
    "message_id": "uuid",
    "status": "SENT",
    "sent_at": "2025-01-24T10:00:00Z"
  }
}
```

---

### POST /api/whatsapp/send-payment-reminder
Send payment reminder.

**Request:**
```json
{
  "customer_id": "uuid",
  "invoice_id": "uuid",
  "phone_number": "+92-300-1234567"
}
```

**Response:**
```json
{
  "data": {
    "message_id": "uuid",
    "status": "SENT",
    "message_preview": "Dear Ali Vape Shop, your invoice EVW-2025-00123..."
  }
}
```

---

## 13. Reports API

### POST /api/reports/export
Export data to CSV/Excel.

**Request:**
```json
{
  "report_type": "SALES",
  "format": "CSV",
  "from_date": "2025-01-01",
  "to_date": "2025-01-31",
  "filters": {
    "status": "PAID"
  }
}
```

**Response:**
```json
{
  "data": {
    "download_url": "https://storage.supabase.co/reports/sales-2025-01.csv",
    "expires_at": "2025-01-24T22:00:00Z"
  }
}
```

---

## 14. Audit Logs API

### GET /api/audit-logs
Get audit logs (admin only).

**Query Parameters:**
- `user_id` - Filter by user
- `action` - Filter by action (CREATE, UPDATE, DELETE, etc.)
- `entity_type` - Filter by entity
- `from_date` - Filter from date
- `to_date` - Filter to date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": {
    "logs": [
      {
        "id": "uuid",
        "user_email": "staff@evw.pk",
        "action": "UPDATE",
        "entity_type": "PRODUCT",
        "entity_id": "uuid",
        "description": "Updated product price",
        "old_values": {
          "retail_price": 1200
        },
        "new_values": {
          "retail_price": 1300
        },
        "ip_address": "192.168.1.100",
        "created_at": "2025-01-24T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `INVALID_INPUT` | Validation error in request data |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `DUPLICATE_ENTRY` | Unique constraint violation (e.g., SKU already exists) |
| `STOCK_INSUFFICIENT` | Not enough stock for operation |
| `CREDIT_LIMIT_EXCEEDED` | Customer credit limit exceeded |
| `INVOICE_ALREADY_PAID` | Cannot modify paid invoice |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

**Limits:**
- Authenticated users: 1000 requests/hour
- Anonymous users: 100 requests/hour

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1674561600
```

**429 Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 minutes.",
    "retry_after": 2700
  }
}
```

---

## Webhooks (Future Feature)

EVW Cloud ERP will support webhooks for real-time notifications:

**Supported Events:**
- `invoice.created`
- `invoice.paid`
- `payment.received`
- `product.low_stock`
- `customer.created`

**Webhook Payload:**
```json
{
  "event": "invoice.paid",
  "timestamp": "2025-01-24T10:00:00Z",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "EVW-2025-00123",
    "amount": 29000
  }
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: Approved for Implementation
