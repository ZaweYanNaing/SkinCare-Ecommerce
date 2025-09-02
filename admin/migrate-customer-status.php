<?php
// Web-accessible migration script to add Status column to Customer table
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $response = ['success' => false, 'messages' => []];
    
    // Check if Status column already exists
    $checkQuery = "SHOW COLUMNS FROM Customer LIKE 'Status'";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute();
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        $response['success'] = true;
        $response['messages'][] = "Status column already exists in Customer table.";
        echo json_encode($response);
        exit;
    }
    
    // Note: ALTER TABLE statements auto-commit, so we don't use transactions for DDL
    
    // 1. Add Status column
    $alterQuery = "ALTER TABLE `Customer` 
                   ADD COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
                   AFTER `SkinType`";
    
    $pdo->exec($alterQuery);
    $response['messages'][] = "✓ Added Status column to Customer table";
    
    // 2. Add index for better performance
    $indexQuery = "ALTER TABLE `Customer` ADD INDEX `idx_customer_status` (`Status`)";
    $pdo->exec($indexQuery);
    $response['messages'][] = "✓ Added index on Status column";
    
    // 3. Add comment to column
    $commentQuery = "ALTER TABLE `Customer` 
                     MODIFY COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
                     COMMENT 'Customer account status: active=normal, warned=has warnings, banned=cannot order'";
    
    $pdo->exec($commentQuery);
    $response['messages'][] = "✓ Added comment to Status column";
    
    // 4. Verify the changes
    $describeQuery = "DESCRIBE Customer";
    $stmt = $pdo->prepare($describeQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $statusColumnFound = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'Status') {
            $statusColumnFound = true;
            $response['messages'][] = "✓ Status column verified: {$column['Type']} (Default: {$column['Default']})";
            break;
        }
    }
    
    if ($statusColumnFound) {
        // 5. Update existing customers to have 'active' status (should be automatic with DEFAULT)
        $updateQuery = "UPDATE Customer SET Status = 'active' WHERE Status IS NULL";
        $stmt = $pdo->prepare($updateQuery);
        $stmt->execute();
        $updatedRows = $stmt->rowCount();
        $response['messages'][] = "✓ Updated {$updatedRows} existing customers to 'active' status";
        
        $response['success'] = true;
        $response['messages'][] = "🎉 Migration completed successfully!";
    } else {
        throw new Exception("Status column was not created properly");
    }
    
} catch (PDOException $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Migration failed: " . $e->getMessage();
}

echo json_encode($response);
?>