<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Simple query to get basic transaction data
    $query = "
        SELECT 
            o.OrderID,
            o.orderDate,
            o.status,
            c.CName as customerName,
            c.CEmail as customerEmail,
            p.Amount as totalAmount,
            p.paymentMethod
        FROM `Order` o
        LEFT JOIN Customer c ON o.customerID = c.CID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        ORDER BY o.orderDate DESC
        LIMIT 10
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get basic stats
    $statsQuery = "
        SELECT 
            COUNT(o.OrderID) as totalOrders,
            COALESCE(SUM(p.Amount), 0) as totalRevenue
        FROM `Order` o
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
    ";
    
    $statsStmt = $pdo->prepare($statsQuery);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Add default values for missing stats
    $stats['pendingOrders'] = 0;
    $stats['confirmedOrders'] = 0;
    $stats['shippedOrders'] = 0;
    $stats['deliveredOrders'] = 0;
    $stats['cancelledOrders'] = 0;
    
    // Count by status
    $statusQuery = "
        SELECT 
            status,
            COUNT(*) as count
        FROM `Order`
        GROUP BY status
    ";
    
    $statusStmt = $pdo->prepare($statusQuery);
    $statusStmt->execute();
    $statusCounts = $statusStmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($statusCounts as $statusCount) {
        $statusKey = $statusCount['status'] . 'Orders';
        if (isset($stats[$statusKey])) {
            $stats[$statusKey] = (int)$statusCount['count'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $transactions,
        'pagination' => [
            'currentPage' => 1,
            'totalPages' => 1,
            'totalRecords' => count($transactions),
            'limit' => 10
        ],
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>