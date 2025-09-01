<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $orderID = $input['orderID'] ?? null;
        
        if ($orderID) {
            // Get order details
            $orderQuery = "
                SELECT 
                    o.OrderID,
                    o.orderDate,
                    c.CName as customerName,
                    c.CEmail as customerEmail,
                    p.Amount as totalAmount
                FROM `Order` o
                JOIN Customer c ON o.customerID = c.CID
                LEFT JOIN Payment p ON o.OrderID = p.OrderID
                WHERE o.OrderID = ?
            ";
            
            $orderStmt = $pdo->prepare($orderQuery);
            $orderStmt->execute([$orderID]);
            $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($order) {
                // Check if notification already exists
                $existingNotificationQuery = "
                    SELECT COUNT(*) as count 
                    FROM Notification 
                    WHERE Message LIKE ? AND Type = 'order'
                ";
                $existingStmt = $pdo->prepare($existingNotificationQuery);
                $existingStmt->execute(["%Order #{$orderID}%"]);
                $exists = $existingStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
                
                if (!$exists) {
                    // Create notification for new order
                    $title = "New Order Received";
                    $message = "Order #{$order['OrderID']} placed by {$order['customerName']} for $" . number_format($order['totalAmount'], 0);
                    
                    $notificationStmt = $pdo->prepare("
                        INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) 
                        VALUES (NULL, ?, ?, 'order', NOW(), 0)
                    ");
                    
                    $notificationStmt->execute([$title, $message]);
                    
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Order notification created',
                        'orderID' => $orderID
                    ]);
                } else {
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Notification already exists for this order'
                    ]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Order not found']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Order ID required']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'POST method required']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>