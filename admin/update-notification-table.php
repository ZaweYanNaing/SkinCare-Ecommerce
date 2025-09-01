<?php
require_once 'config/database.php';

try {
    // Add new columns to Notification table
    $alterQueries = [
        "ALTER TABLE Notification ADD COLUMN IF NOT EXISTS Title VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE Notification ADD COLUMN IF NOT EXISTS Type VARCHAR(50) DEFAULT 'general'",
        "ALTER TABLE Notification MODIFY COLUMN DateSent DATETIME DEFAULT CURRENT_TIMESTAMP"
    ];
    
    foreach ($alterQueries as $query) {
        try {
            $pdo->exec($query);
            echo "Executed: $query\n";
        } catch (PDOException $e) {
            // Column might already exist, continue
            echo "Note: " . $e->getMessage() . "\n";
        }
    }
    
    // Insert some sample notifications for testing
    $sampleNotifications = [
        [
            'customerID' => 5,
            'title' => 'Order Confirmation',
            'message' => 'Your order #12345 has been confirmed and is being processed.',
            'type' => 'order'
        ],
        [
            'customerID' => 6,
            'title' => 'Low Stock Alert',
            'message' => 'EAORON Toner is running low in stock (2 items remaining).',
            'type' => 'alert'
        ],
        [
            'customerID' => 7,
            'title' => 'New Product Available',
            'message' => 'Check out our new SK Retinol Serum - perfect for anti-aging!',
            'type' => 'promotion'
        ],
        [
            'customerID' => null,
            'title' => 'System Maintenance',
            'message' => 'Scheduled maintenance will occur tonight from 2-4 AM.',
            'type' => 'system'
        ],
        [
            'customerID' => 8,
            'title' => 'Payment Received',
            'message' => 'We have received your payment for order #12346. Thank you!',
            'type' => 'payment'
        ]
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) 
        VALUES (?, ?, ?, ?, NOW(), ?)
    ");
    
    foreach ($sampleNotifications as $index => $notification) {
        $isRead = $index < 2 ? 0 : 1; // First 2 notifications are unread
        $stmt->execute([
            $notification['customerID'],
            $notification['title'],
            $notification['message'],
            $notification['type'],
            $isRead
        ]);
    }
    
    echo "Sample notifications inserted successfully!\n";
    echo "Notification table updated successfully!\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>