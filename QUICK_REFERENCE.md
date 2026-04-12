# Quick Reference - Public Endpoints

## 🎯 Quick Start

The e-commerce backend now has public (unauthenticated) endpoints for browsing products and categories.

### Base URL
```
http://localhost:4000/api/v1
```

## 📦 Products Endpoints

### List Products
```
GET /public/products
```

**Query Parameters:**
- `page=1` - Page number
- `limit=20` - Items per page (max 100)
- `search=keyword` - Search term
- `category=uuid` - Category filter

**Example:**
```bash
curl "http://localhost:4000/api/v1/public/products?page=1&limit=20&search=wireless"
```

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "name": "Wireless Headphones",
      "price": 299.99,
      "currency": "USD",
      "inStock": true,
      "availableQuantity": 50,
      "images": [{"url": "...", "altText": "..."}],
      "category": {"id": "...", "name": "Electronics"}
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

### Get Single Product
```
GET /public/products/{id}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/public/products/clc123456789abcdefghijklmn"
```

**Response:** Full product details including all images, categories, and meta information.

---

## 🏷️ Categories Endpoints

### List Categories
```
GET /public/categories
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/public/categories"
```

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "name": "Electronics",
      "description": "All electronic items",
      "productCount": 45,
      "children": [
        {
          "id": "...",
          "name": "Audio",
          "productCount": 12,
          "children": []
        }
      ]
    }
  ]
}
```

### Get Single Category
```
GET /public/categories/{id}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/public/categories/cat123"
```

---

## 🔐 Security

✅ **No authentication required** - These endpoints are public  
✅ **No admin fields exposed** - Cost prices are hidden  
✅ **Existing endpoints protected** - Admin endpoints still require JWT  
✅ **CORS enabled** - Can be called from frontend  

---

## 📊 Data Structure

### Product (List View)
```typescript
{
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images: Array<{url: string; altText?: string}>;
  inStock: boolean;
  availableQuantity: number;
  category?: {id: string; name: string};
  featuredImage?: string;
}
```

### Product (Detail View)
Includes all list fields plus:
```typescript
{
  sku: string;
  shortDescription?: string;
  compareAtPrice?: number;
  categories: Array<{id: string; name: string}>;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Category
```typescript
{
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  productCount: number;
  children?: Category[];
}
```

---

## 🧪 Test in Browser

Visit these URLs directly:

```
http://localhost:4000/api/v1/public/products
http://localhost:4000/api/v1/public/products?search=test&limit=10
http://localhost:4000/api/v1/public/categories
```

---

## 🚀 Frontend Integration

```typescript
// Fetch products
const response = await fetch('/api/v1/public/products?page=1&limit=20');
const data = await response.json();
console.log(data.items); // Array of products

// Fetch product detail
const product = await fetch('/api/v1/public/products/abc123');
const detail = await product.json();

// Fetch categories
const categories = await fetch('/api/v1/public/categories');
const cats = await categories.json();
```

---

## 📋 Features

| Feature | Status |
|---------|--------|
| Pagination | ✅ Supported |
| Search | ✅ By name, description, SKU |
| Filtering | ✅ By category |
| Stock Tracking | ✅ Shows availability |
| Images | ✅ All included with alt text |
| Hierarchical Categories | ✅ Supported |
| JWT Required | ✅ No |
| Admin Fields Exposed | ✅ No |

---

## 🔍 Filtering Logic

**Public Products:**
- Only shows products where `isActive = true` AND `status = ACTIVE`
- Searches across name, description, and SKU (case-insensitive)
- Can filter by single category

**Public Categories:**
- Only shows categories where `isActive = true`
- Shows only top-level categories by default
- Includes all active subcategories recursively
- Shows product count for each category

---

## 📞 Support

For detailed documentation, see: `PUBLIC_ENDPOINTS_DOCUMENTATION.md`
For implementation details, see: `IMPLEMENTATION_SUMMARY.md`
