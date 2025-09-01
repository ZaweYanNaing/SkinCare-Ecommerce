<?php
require_once '../config/database.php';

try {
    echo "Setting up notification table...\n";
    
    // Add Title column if it doesn't exist
    try {
        $pdo->exec("ALTER TABLE Notification ADD COLUMN Title VARCHAR(255) DEFAULT NULL");
        echo "Added Title column\n";
    } catch (PDOException $e) {
        echo "Title column already exists or error: " . $e->getMessage() . "\n";
    }
    
    // Add Type column if it doesn't exist
    try {
        $pdo->exec("ALTER TABLE Notification ADD COLUMN Type VARCHAR(50) DEFAULT 'general'");
        echo "Added Type column\n";
    } catch (PDOException $e) {
        echo "Type column already exists or error: " . $e->getMessage() . "\n";
    }
    
    // Modify DateSent column
    try {
        $pdo->exec("ALTER TABLE Notification MODIFY COLUMN DateSent DATETIME DEFAULT CURRENT_TIMESTAMP");
        echo "Modified DateSent column\n";
    } catch (PDOException $e) {
        echo "DateSent column modification error: " . $e->getMessage() . "\n";
    }
    
    // Clear existing notifications
    $pdo->exec("DELETE FROM Notification");
    echo "Cleared existing notifications\n";
    
    // Insert test notifications
    $testNotifications = [
        [
            'title' => 'System Ready',
            'message' => 'Notification system has been set up successfully.',
            'type' => 'general'
        ],
        [
            'title' => 'Low Stock Alert',
            'message' => 'EAORON Toner is running low in stock (0 items remaining).',
            'type' => 'alert'
        ]
    ];
    
    $stmt = $pdo->prepare("INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) VALUES (NULL, ?, ?, ?, NOW(), 0)");
    
    foreach ($testNotifications as $notification) {
        $stmt->execute([$notification['title'], $notification['message'], $notification['type']]);
    }
    
    echo "Inserted test notifications\n";
    echo "Setup completed successfully!\n";
    
    // Test the notifications endpoint
    echo "\nTesting notifications endpoint...\n";
    
    $query = "SELECT NotiID, Title, Message, Type, DateSent, isRead FROM Notification ORDER BY DateSent DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($notifications) . " notifications:\n";
    foreach ($notifications as $notification) {
        echo "- {$notification['Title']} ({$notification['Type']}): {$notification['Message']}\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>