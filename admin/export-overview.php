<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    // Get overview statistics
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
    
    // Get sales by category
    $salesByCategoryQuery = "
        SELECT 
            c.CategoryName,
            SUM(oi.Quantity) as total_quantity,
            SUM(oi.Quantity * oi.unitPrice) as total_sales,
            COUNT(DISTINCT oi.OrderID) as order_count
        FROM OrderItem oi
        JOIN Product p ON oi.ProductID = p.ProductID
        JOIN Categories c ON p.CategoryID = c.CategoryID
        GROUP BY c.CategoryID, c.CategoryName
        ORDER BY total_quantity DESC
    ";
    $salesByCategoryStmt = $pdo->query($salesByCategoryQuery);
    $salesByCategory = $salesByCategoryStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get top products
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
    
    // Get recent orders
    $recentOrdersQuery = "
        SELECT 
            o.OrderID,
            c.CName as customer_name,
            o.orderDate,
            o.status,
            p.Amount as payment_amount,
            p.paymentMethod
        FROM `Order` o
        JOIN Customer c ON o.customerID = c.CID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        ORDER BY o.orderDate DESC
        LIMIT 20
    ";
    $recentOrdersStmt = $pdo->query($recentOrdersQuery);
    $recentOrders = $recentOrdersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get monthly sales trend (last 6 months)
    $monthlySalesQuery = "
        SELECT 
            DATE_FORMAT(p.PayDate, '%Y-%m') as month,
            SUM(p.Amount) as monthly_sales,
            COUNT(DISTINCT p.OrderID) as monthly_orders
        FROM Payment p
        WHERE p.PayDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(p.PayDate, '%Y-%m')
        ORDER BY month DESC
    ";
    $monthlySalesStmt = $pdo->query($monthlySalesQuery);
    $monthlySales = $monthlySalesStmt->fetchAll(PDO::FETCH_ASSOC);
    
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
    
    $response = [
        'success' => true,
        'data' => $exportData
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>