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
    // $pdo is already created in database.php
    
    // Test basic connectivity and data
    $testQueries = [
        'orders_count' => "SELECT COUNT(*) as count FROM `Order`",
        'payments_count' => "SELECT COUNT(*) as count FROM Payment",
        'recent_orders' => "SELECT OrderID, customerID, orderDate, status FROM `Order` ORDER BY orderDate DESC LIMIT 5",
        'recent_payments' => "SELECT PaymentID, OrderID, Amount, PayDate, paymentMethod FROM Payment ORDER BY PayDate DESC LIMIT 5",
        'date_range_orders' => "SELECT MIN(orderDate) as min_date, MAX(orderDate) as max_date FROM `Order`",
        'date_range_payments' => "SELECT MIN(PayDate) as min_date, MAX(PayDate) as max_date FROM Payment"
    ];
    
    $results = [];
    
    foreach ($testQueries as $key => $query) {
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $results[$key] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'current_date' => date('Y-m-d H:i:s'),
        'server_timezone' => date_default_timezone_get(),
        'data' => $results
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>