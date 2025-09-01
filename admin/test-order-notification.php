<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    // Get the most recent order to test with
    $recentOrderQuery = "
        SELECT 
            o.OrderID,
            o.orderDate,
            c.CName as customerName,
            c.CEmail as customerEmail,
            p.Amount as totalAmount
        FROM `Order` o
        JOIN Customer c ON o.customerID = c.CID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        ORDER BY o.orderDate DESC
        LIMIT 1
    ";
    
    $stmt = $pdo->prepare($recentOrderQuery);
    $stmt->execute();
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($order) {
        // Create a test notification for this order
        $title = "New Order Received (Test)";
        $message = "Order #{$order['OrderID']} placed by {$order['customerName']} for $" . number_format($order['totalAmount'], 0);
        
        $notificationStmt = $pdo->prepare("
            INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) 
            VALUES (NULL, ?, ?, 'order', NOW(), 0)
        ");
        
        $notificationStmt->execute([$title, $message]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Test order notification created',
            'order' => $order,
            'notification' => [
                'title' => $title,
                'message' => $message
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No orders found']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>