# Public E-commerce Endpoints Documentation

## Overview

This document describes the new public (unauthenticated) endpoints created for the e-commerce backend to support a Vite React frontend shop. These endpoints allow users to browse products and categories WITHOUT requiring JWT authentication.

## Endpoints

### Public Products Endpoints

#### 1. Get All Products (Paginated)

**Endpoint:** `GET /api/v1/public/products`

**Authentication:** None required

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 20, max: 100) - Items per page
- `search` (optional) - Search by product name, description, or SKU
- `category` (optional) - Filter by category ID

**Example Request:**
```bash
GET /api/v1/public/products?page=1&limit=20&search=wireless&category=abc123
```

**Response:** (200 OK)
```json
{
  "items": [
    {
      "id": "clc123456789abcdefghijklmn",
      "name": "Wireless Headphones",
      "description": "Premium noise-cancelling headphones",
      "price": 299.99,
      "currency": "USD",
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "altText": "Product front view"
        }
      ],
      "inStock": true,
      "availableQuantity": 50,
      "category": {
        "id": "cat123",
        "name": "Electronics"
      },
      "featuredImage": "https://example.com/featured.jpg"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

**Response Codes:**
- `200` - Success
- `400` - Invalid query parameters

---

#### 2. Get Product By ID

**Endpoint:** `GET /api/v1/public/products/:id`

**Authentication:** None required

**Path Parameters:**
- `id` - Product UUID

**Example Request:**
```bash
GET /api/v1/public/products/clc123456789abcdefghijklmn
```

**Response:** (200 OK)
```json
{
  "id": "clc123456789abcdefghijklmn",
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones with active noise cancellation",
  "shortDescription": "Premium wireless headphones",
  "sku": "WH-1000XM5",
  "price": 299.99,
  "compareAtPrice": 349.99,
  "currency": "USD",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "altText": "Product front view"
    },
    {
      "url": "https://example.com/image2.jpg",
      "altText": "Product side view"
    }
  ],
  "inStock": true,
  "availableQuantity": 50,
  "categories": [
    {
      "id": "cat123",
      "name": "Electronics"
    },
    {
      "id": "cat456",
      "name": "Audio"
    }
  ],
  "featuredImage": "https://example.com/featured.jpg",
  "seoTitle": "Wireless Headphones | My Store",
  "seoDescription": "Buy the best wireless headphones online.",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response Codes:**
- `200` - Success
- `404` - Product not found

---

### Public Categories Endpoints

#### 3. Get All Categories

**Endpoint:** `GET /api/v1/public/categories`

**Authentication:** None required

**Example Request:**
```bash
GET /api/v1/public/categories
```

**Response:** (200 OK)
```json
{
  "items": [
    {
      "id": "cat123",
      "name": "Electronics",
      "description": "All electronic items",
      "parentId": null,
      "sortOrder": 0,
      "productCount": 45,
      "children": [
        {
          "id": "cat456",
          "name": "Audio",
          "description": "Audio devices",
          "parentId": "cat123",
          "sortOrder": 0,
          "productCount": 12,
          "children": []
        }
      ]
    }
  ]
}
```

**Response Codes:**
- `200` - Success

---

#### 4. Get Category By ID

**Endpoint:** `GET /api/v1/public/categories/:id`

**Authentication:** None required

**Path Parameters:**
- `id` - Category UUID

**Example Request:**
```bash
GET /api/v1/public/categories/cat123
```

**Response:** (200 OK)
```json
{
  "id": "cat123",
  "name": "Electronics",
  "description": "All electronic items",
  "parentId": null,
  "sortOrder": 0,
  "productCount": 45,
  "children": [
    {
      "id": "cat456",
      "name": "Audio",
      "description": "Audio devices",
      "parentId": "cat123",
      "sortOrder": 0,
      "productCount": 12,
      "children": []
    }
  ]
}
```

**Response Codes:**
- `200` - Success
- `404` - Category not found

---

## Implementation Details

### What Was Created

1. **DTOs (Data Transfer Objects)**
   - `src/modules/products/dto/public-product.dto.ts` - Product response models
   - `src/modules/categories/dto/public-category.dto.ts` - Category response models

2. **Controllers**
   - `src/modules/products/controllers/public-products.controller.ts` - Public products endpoints
   - `src/modules/categories/controllers/public-categories.controller.ts` - Public categories endpoints

3. **Service Methods**
   - `ProductsService.findPublicProducts()` - Fetch paginated public products
   - `ProductsService.findPublicProduct()` - Fetch single product detail
   - `CategoriesService.findPublicCategories()` - Fetch all public categories
   - `CategoriesService.findPublicCategory()` - Fetch single category detail

### Data Filtering

**Public Products are filtered by:**
- `isActive: true` - Only active products are shown
- `status: ProductStatus.ACTIVE` - Only products with ACTIVE status are shown

**Public Categories are filtered by:**
- `isActive: true` - Only active categories are shown
- Top-level categories shown by default (with recursive children)

### Security

- ✅ **No JWT Guards** - Public endpoints do NOT require authentication
- ✅ **No Permission Checks** - All users can access these endpoints
- ✅ **Data Privacy** - Admin-only fields like `costPrice` are never exposed
- ✅ **Existing Controllers Protected** - Admin endpoints remain protected
- ✅ **CORS Enabled** - Frontend can call these endpoints

### Stock Management

**Available Quantity Logic:**
```
if product.trackQuantity === true:
  availableQuantity = product.stockQuantity
else:
  availableQuantity = 0 (unlimited stock)

inStock = !trackQuantity || stockQuantity > 0
```

### Pagination

- Default: 20 items per page
- Max limit: 100 items per page
- Returns total count and page metadata

### Search

Products can be searched by:
- Product name (case-insensitive)
- Product description (case-insensitive)
- Product SKU (case-insensitive)

## Frontend Integration Example

### React Hook for Products List

```typescript
import { useState, useEffect } from 'react';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/v1/public/products?page=${page}&limit=20`);
        const data = await response.json();
        setProducts(data.items);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price} {product.currency}</p>
          {product.images[0] && <img src={product.images[0].url} alt={product.images[0].altText} />}
          <p>In Stock: {product.inStock ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
}
```

### React Hook for Product Detail

```typescript
function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/v1/public/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price} {product.currency}</p>
      {product.compareAtPrice && <p>Was: ${product.compareAtPrice}</p>}
      <div>
        {product.images.map(img => (
          <img key={img.url} src={img.url} alt={img.altText} />
        ))}
      </div>
    </div>
  );
}
```

## Module Registration

Both controllers are automatically registered in their respective modules:

**ProductsModule:**
```typescript
@Module({
  imports: [AuditLogsModule],
  providers: [ProductsService],
  controllers: [ProductsController, PublicProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**CategoriesModule:**
```typescript
@Module({
  imports: [AuditLogsModule],
  providers: [CategoriesService],
  controllers: [CategoriesController, PublicCategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

## Testing Endpoints

### Using cURL

```bash
# Get all products
curl http://localhost:4000/api/v1/public/products

# Get products with search
curl "http://localhost:4000/api/v1/public/products?search=wireless&limit=10"

# Get single product
curl http://localhost:4000/api/v1/public/products/clc123456789abcdefghijklmn

# Get all categories
curl http://localhost:4000/api/v1/public/categories

# Get single category
curl http://localhost:4000/api/v1/public/categories/cat123
```

### Using Postman

1. Base URL: `http://localhost:4000/api/v1`
2. Public Products Collection:
   - GET `/public/products`
   - GET `/public/products?page=1&limit=20&search=test&category=abc123`
   - GET `/public/products/:id`
3. Public Categories Collection:
   - GET `/public/categories`
   - GET `/public/categories/:id`

## Error Handling

All endpoints follow the NestJS global exception filter. Common responses:

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["page must be >= 1", "limit must be a number"],
  "error": "Bad Request"
}
```

## Performance Considerations

- Products are ordered by `createdAt` descending (newest first)
- Categories are ordered by `sortOrder` ascending, then `createdAt`
- Queries include optimized relations (images, categories with counts)
- No N+1 query problems - uses Prisma's `include` strategically

## Next Steps

1. **Frontend Implementation** - Use the examples above to integrate with React
2. **Caching** - Consider adding Redis caching for frequently accessed products/categories
3. **Rate Limiting** - Consider adding rate limiting to public endpoints
4. **Analytics** - Track product views and searches for insights
5. **SEO** - Use `seoTitle` and `seoDescription` fields for meta tags

---

**Created Date:** 2026-04-12
**API Version:** v1
**Status:** Production Ready
