<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    // $pdo is already created in database.php
    
    // Get total sales amount
    $totalSalesQuery = "SELECT COALESCE(SUM(Amount), 0) as total_sales FROM Payment";
    $totalSalesStmt = $pdo->query($totalSalesQuery);
    $totalSales = $totalSalesStmt->fetch(PDO::FETCH_ASSOC)['total_sales'];
    
    // Get total orders count
    $totalOrdersQuery = "SELECT COUNT(*) as total_orders FROM `Order`";
    $totalOrdersStmt = $pdo->query($totalOrdersQuery);
    $totalOrders = $totalOrdersStmt->fetch(PDO::FETCH_ASSOC)['total_orders'];
    
    // Get best selling product by quantity
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
    $bestSellingProduct = $bestSelling ? $bestSelling['Name'] : 'N/A';
    
    // Get active customers (customers who made orders in last 30 days)
    $activeCustomersQuery = "
        SELECT COUNT(DISTINCT customerID) as active_customers
        FROM `Order`
        WHERE orderDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ";
    $activeCustomersStmt = $pdo->query($activeCustomersQuery);
    $activeCustomers = $activeCustomersStmt->fetch(PDO::FETCH_ASSOC)['active_customers'];
    
    $response = [
        'success' => true,
        'data' => [
            'totalSales' => number_format($totalSales),
            'totalOrders' => $totalOrders,
            'bestSellingProduct' => $bestSellingProduct,
            'activeCustomers' => $activeCustomers
        ]
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