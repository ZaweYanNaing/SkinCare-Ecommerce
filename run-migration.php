<?php
// Simple migration runner to add Status column to Customer table
require_once 'config/database.php';

try {
    echo "Starting migration to add Status column to Customer table...\n";
    
    // Check if Status column already exists
    $checkQuery = "SHOW COLUMNS FROM Customer LIKE 'Status'";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute();
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        echo "Status column already exists in Customer table.\n";
        exit;
    }
    
    // Add Status column
    $alterQuery = "ALTER TABLE `Customer` 
                   ADD COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
                   AFTER `SkinType`";
    
    $pdo->exec($alterQuery);
    echo "✓ Added Status column to Customer table\n";
    
    // Add index for better performance
    $indexQuery = "ALTER TABLE `Customer` ADD INDEX `idx_customer_status` (`Status`)";
    $pdo->exec($indexQuery);
    echo "✓ Added index on Status column\n";
    
    // Add comment to column
    $commentQuery = "ALTER TABLE `Customer` 
                     MODIFY COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
                     COMMENT 'Customer account status: active=normal, warned=has warnings, banned=cannot order'";
    
    $pdo->exec($commentQuery);
    echo "✓ Added comment to Status column\n";
    
    // Verify the changes
    $describeQuery = "DESCRIBE Customer";
    $stmt = $pdo->prepare($describeQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nCustomer table structure after migration:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Default']})\n";
    }
    
    echo "\n✅ Migration completed successfully!\n";
    
} catch (PDOException $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>