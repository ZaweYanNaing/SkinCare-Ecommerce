<?php
// This script should be run as a cron job every few minutes
// Example cron: */5 * * * * php /path/to/cleanup_experts.php

// Database connection (adjust these credentials as needed)
$host = 'localhost';
$dbname = 'skincare_db'; // Replace with your database name
$username = 'root'; // Replace with your database username
$password = ''; // Replace with your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
    exit;
}

try {
    // Set experts to offline if they haven't been active for more than 10 minutes
    // This gives enough time for page refreshes and temporary disconnections
    $stmt = $pdo->prepare("
        UPDATE experts 
        SET Status = 'offline' 
        WHERE Status = 'active' 
        AND (LastActivity IS NULL OR LastActivity < DATE_SUB(NOW(), INTERVAL 10 MINUTE))
    ");
    
    $stmt->execute();
    
    $affectedRows = $stmt->rowCount();
    echo "Set $affectedRows experts to offline due to inactivity\n";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>