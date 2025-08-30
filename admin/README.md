# Admin API Endpoints

This directory contains the backend API endpoints for the admin dashboard.

## Endpoints

### 1. Overview Statistics
**URL:** `/admin/overview-stats.php`  
**Method:** GET  
**Description:** Returns dashboard statistics including total sales, orders, best selling product, and active customers.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": "1,234,567",
    "totalOrders": 123,
    "bestSellingProduct": "Product Name",
    "activeCustomers": 45
  }
}
```

### 2. Sales by Category
**URL:** `/admin/sales-by-category.php`  
**Method:** GET  
**Description:** Returns sales data grouped by product categories for the overview chart.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Toner",
      "sales": 850,
      "revenue": 123456.78
    },
    {
      "category": "Serum",
      "sales": 720,
      "revenue": 98765.43
    }
  ]
}
```

### 3. Top Products
**URL:** `/admin/top-products.php`  
**Method:** GET  
**Description:** Returns the top 5 best-selling products by quantity.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "orders": 80,
      "amount": "$2,200",
      "product": "Product Name"
    }
  ]
}
```

### 4. Test Endpoint
**URL:** `/admin/test.php`  
**Method:** GET  
**Description:** Tests database connectivity and returns product count.

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "product_count": 22
}
```

## Setup

1. Make sure Docker is running with the backend services
2. The APIs will be available at `http://localhost/admin/`
3. CORS is configured to allow requests from the frontend

## Database Tables Used

- `Payment` - For total sales calculations
- `Order` - For order counts and active customer metrics
- `OrderItem` - For product sales quantities
- `Product` - For product information
- `Categories` - For category-based sales data
- `Customer` - For customer activity tracking

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```