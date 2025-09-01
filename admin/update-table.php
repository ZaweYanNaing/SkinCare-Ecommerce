<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    // Add missing columns
    $alterQueries = [
        "ALTER TABLE Notification ADD COLUMN Title VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE Notification ADD COLUMN Type VARCHAR(50) DEFAULT 'general'",
        "ALTER TABLE Notification MODIFY COLUMN DateSent DATETIME DEFAULT CURRENT_TIMESTAMP"
    ];
    
    $results = [];
    
    foreach ($alterQueries as $query) {
        try {
            $pdo->exec($query);
            $results[] = "Success: " . $query;
        } catch (PDOException $e) {
            $results[] = "Error/Already exists: " . $e->getMessage();
        }
    }
    
    // Insert a test notification
    try {
        $stmt = $pdo->prepare("INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) VALUES (NULL, ?, ?, ?, NOW(), 0)");
        $stmt->execute(['Test Notification', 'This is a test notification to verify the system works.', 'general']);
        $results[] = "Test notification inserted";
    } catch (PDOException $e) {
        $results[] = "Test notification error: " . $e->getMessage();
    }
    
    echo json_encode([
        'success' => true,
        'results' => $results
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>