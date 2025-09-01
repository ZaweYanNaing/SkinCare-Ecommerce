<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Get overview statistics for report context
    $totalSalesQuery = "SELECT COALESCE(SUM(Amount), 0) as total_sales FROM Payment";
    $totalSalesStmt = $pdo->query($totalSalesQuery);
    $totalSales = $totalSalesStmt->fetch(PDO::FETCH_ASSOC)['total_sales'];
    
    $totalOrdersQuery = "SELECT COUNT(*) as total_orders FROM `Order`";
    $totalOrdersStmt = $pdo->query($totalOrdersQuery);
    $totalOrders = $totalOrdersStmt->fetch(PDO::FETCH_ASSOC)['total_orders'];
    
    $bestSellingQuery = "
        SELECT p.Name, SUM(oi.Quantity) as total_quantity
        FROM OrderItem oi
        JOIN Product p ON oi.ProductID = p.ProductID
        GROUP BY oi.ProductID, p.Name
        ORDER BY total_quantity DESC
        LIMIT 1
    ";
    $bestSellingStmt = $pdo->query($bestSellingQuery);
    $bestSelling = $bestSellingStmt->fetch(PDO::FETCH_ASSOC);
    
    $activeCustomersQuery = "
        SELECT COUNT(DISTINCT customerID) as active_customers
        FROM `Order`
        WHERE orderDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ";
    $activeCustomersStmt = $pdo->query($activeCustomersQuery);
    $activeCustomers = $activeCustomersStmt->fetch(PDO::FETCH_ASSOC)['active_customers'];
    
    // Get sales by category (using top customers as categories for report context)
    $salesByCategoryQuery = "
        SELECT 
            c.CName as CategoryName,
            COUNT(DISTINCT o.OrderID) as total_quantity,
            SUM(p.Amount) as total_sales,
            COUNT(DISTINCT o.OrderID) as order_count
        FROM Payment p
        JOIN `Order` o ON p.OrderID = o.OrderID
        JOIN Customer c ON o.customerID = c.CID
        WHERE o.status = 'confirmed'
        GROUP BY c.CID, c.CName
        ORDER BY total_sales DESC
        LIMIT 5
    ";
    $salesByCategoryStmt = $pdo->query($salesByCategoryQuery);
    $salesByCategory = $salesByCategoryStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get top products (actual top products)
    $topProductsQuery = "
        SELECT 
            p.Name,
            SUM(oi.Quantity) as total_orders,
            SUM(oi.Quantity * oi.unitPrice) as total_revenue,
            AVG(oi.unitPrice) as avg_price,
            p.Stock as current_stock
        FROM OrderItem oi
        JOIN Product p ON oi.ProductID = p.ProductID
        GROUP BY oi.ProductID, p.Name, p.Stock
        ORDER BY total_orders DESC
        LIMIT 10
    ";
    $topProductsStmt = $pdo->query($topProductsQuery);
    $topProducts = $topProductsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent orders (top customer transactions)
    $recentOrdersQuery = "
        SELECT 
            p.PaymentID as OrderID,
            c.CName as customer_name,
            p.PayDate as orderDate,
            'confirmed' as status,
            p.Amount as payment_amount,
            p.paymentMethod
        FROM Payment p
        JOIN `Order` o ON p.OrderID = o.OrderID
        JOIN Customer c ON o.customerID = c.CID
        WHERE o.status = 'confirmed'
        ORDER BY p.PayDate DESC
        LIMIT 20
    ";
    $recentOrdersStmt = $pdo->query($recentOrdersQuery);
    $recentOrders = $recentOrdersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get monthly sales trend (last 6 months)
    $monthlySalesQuery = "
        SELECT 
            DATE_FORMAT(o.orderDate, '%Y-%m') as month,
            SUM(p.Amount) as monthly_sales,
            COUNT(DISTINCT o.OrderID) as monthly_orders
        FROM `Order` o
        JOIN Payment p ON o.OrderID = p.OrderID
        WHERE o.status = 'confirmed'
        AND o.orderDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(o.orderDate, '%Y-%m')
        ORDER BY month DESC
    ";
    $monthlySalesStmt = $pdo->query($monthlySalesQuery);
    $monthlySales = $monthlySalesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Structure data to match Overview export format
    $exportData = [
        'overview_stats' => [
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'best_selling_product' => $bestSelling ? $bestSelling['Name'] : 'N/A',
            'best_selling_quantity' => $bestSelling ? $bestSelling['total_quantity'] : 0,
            'active_customers' => $activeCustomers,
            'export_date' => date('Y-m-d H:i:s')
        ],
        'sales_by_category' => $salesByCategory,
        'top_products' => $topProducts,
        'recent_orders' => $recentOrders,
        'monthly_sales_trend' => $monthlySales
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $exportData
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>