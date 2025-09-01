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
    // Check for new orders (orders placed in last 24 hours that don't have notifications yet)
    $newOrdersQuery = "
        SELECT 
            o.OrderID,
            o.orderDate,
            c.CName as customerName,
            c.CEmail as customerEmail,
            p.Amount as totalAmount
        FROM `Order` o
        JOIN Customer c ON o.customerID = c.CID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        WHERE o.orderDate >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND NOT EXISTS (
            SELECT 1 FROM Notification n 
            WHERE n.Message LIKE CONCAT('%Order #', o.OrderID, '%') 
            AND n.Type = 'order'
        )
        ORDER BY o.orderDate DESC
    ";
    
    $newOrdersStmt = $pdo->prepare($newOrdersQuery);
    $newOrdersStmt->execute();
    $newOrders = $newOrdersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create notifications for new orders
    $orderNotificationStmt = $pdo->prepare("
        INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) 
        VALUES (NULL, ?, ?, 'order', NOW(), 0)
    ");
    
    foreach ($newOrders as $order) {
        $title = "New Order Received";
        $message = "Order #{$order['OrderID']} placed by {$order['customerName']} for $" . number_format($order['totalAmount'], 0);
        $orderNotificationStmt->execute([$title, $message]);
    }
    
    // Check for low stock products (stock <= 5 and no recent notification)
    $lowStockQuery = "
        SELECT 
            ProductID,
            Name,
            Stock,
            CategoryID
        FROM Product 
        WHERE Stock <= 5 
        AND Stock > 0
        AND NOT EXISTS (
            SELECT 1 FROM Notification n 
            WHERE n.Message LIKE CONCAT('%', Product.Name, '%low stock%') 
            AND n.DateSent >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            AND n.Type = 'alert'
        )
        ORDER BY Stock ASC
    ";
    
    $lowStockStmt = $pdo->prepare($lowStockQuery);
    $lowStockStmt->execute();
    $lowStockProducts = $lowStockStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create notifications for low stock
    $stockNotificationStmt = $pdo->prepare("
        INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) 
        VALUES (NULL, ?, ?, 'alert', NOW(), 0)
    ");
    
    foreach ($lowStockProducts as $product) {
        $title = "Low Stock Alert";
        $message = "{$product['Name']} is running low in stock ({$product['Stock']} items remaining)";
        $stockNotificationStmt->execute([$title, $message]);
    }
    
    // Check for out of stock products
    $outOfStockQuery = "
        SELECT 
            ProductID,
            Name
        FROM Product 
        WHERE Stock = 0
        AND NOT EXISTS (
            SELECT 1 FROM Notification n 
            WHERE n.Message LIKE CONCAT('%', Product.Name, '%out of stock%') 
            AND n.DateSent >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            AND n.Type = 'alert'
        )
    ";
    
    $outOfStockStmt = $pdo->prepare($outOfStockQuery);
    $outOfStockStmt->execute();
    $outOfStockProducts = $outOfStockStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create notifications for out of stock
    foreach ($outOfStockProducts as $product) {
        $title = "Out of Stock Alert";
        $message = "{$product['Name']} is completely out of stock and needs restocking";
        $stockNotificationStmt->execute([$title, $message]);
    }
    
    $response = [
        'success' => true,
        'processed' => [
            'new_orders' => count($newOrders),
            'low_stock_alerts' => count($lowStockProducts),
            'out_of_stock_alerts' => count($outOfStockProducts)
        ]
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>