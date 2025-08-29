<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? null;
    
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }
    
    try {
        // Get orders with payment information
        $orderStmt = $pdo->prepare("
            SELECT 
                o.OrderID,
                o.orderDate,
                o.status,
                p.Amount as totalAmount,
                p.paymentMethod
            FROM `Order` o
            LEFT JOIN Payment p ON o.OrderID = p.OrderID
            WHERE o.customerID = ?
            ORDER BY o.orderDate DESC
        ");
        $orderStmt->execute([$userId]);
        $orders = $orderStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get order items for each order
        foreach ($orders as &$order) {
            $itemStmt = $pdo->prepare("
                SELECT 
                    oi.ID,
                    oi.ProductID,
                    oi.Quantity,
                    oi.unitPrice,
                    pr.Name as ProductName,
                    pr.Image
                FROM OrderItem oi
                JOIN Product pr ON oi.ProductID = pr.ProductID
                WHERE oi.OrderID = ?
            ");
            $itemStmt->execute([$order['OrderID']]);
            $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>