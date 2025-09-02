<?php
// Web-accessible migration script to update Admin table with role-based access control
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $response = ['success' => false, 'messages' => []];
    
    // Check if Type column is already ENUM
    $checkQuery = "SHOW COLUMNS FROM Admin WHERE Field = 'Type'";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute();
    $column = $stmt->fetch();
    
    if ($column && strpos($column['Type'], 'enum') !== false) {
        $response['success'] = true;
        $response['messages'][] = "Admin roles are already configured with ENUM values.";
        echo json_encode($response);
        exit;
    }
    
    // 1. Update Type column to use ENUM with specific roles
    $alterTypeQuery = "ALTER TABLE `Admin` 
                       MODIFY COLUMN `Type` ENUM('Super Admin', 'Manager', 'Staff', 'Expert') NOT NULL DEFAULT 'Staff'
                       COMMENT 'Admin role: Super Admin=full access, Manager=no admin creation, Staff=no account/product mgmt, Expert=specialized access'";
    
    $pdo->exec($alterTypeQuery);
    $response['messages'][] = "✓ Updated Type column to use ENUM values";
    
    // 2. Add RoleDescription column if it doesn't exist
    $checkDescQuery = "SHOW COLUMNS FROM Admin LIKE 'RoleDescription'";
    $stmt = $pdo->prepare($checkDescQuery);
    $stmt->execute();
    $descExists = $stmt->fetch();
    
    if (!$descExists) {
        $addDescQuery = "ALTER TABLE `Admin` 
                         ADD COLUMN `RoleDescription` TEXT NULL 
                         COMMENT 'Description of admin role and permissions'
                         AFTER `Type`";
        
        $pdo->exec($addDescQuery);
        $response['messages'][] = "✓ Added RoleDescription column";
    } else {
        $response['messages'][] = "✓ RoleDescription column already exists";
    }
    
    // 3. Add timestamp columns if they don't exist
    $checkTimestampQuery = "SHOW COLUMNS FROM Admin LIKE 'CreatedAt'";
    $stmt = $pdo->prepare($checkTimestampQuery);
    $stmt->execute();
    $timestampExists = $stmt->fetch();
    
    if (!$timestampExists) {
        $addTimestampQuery = "ALTER TABLE `Admin` 
                              ADD COLUMN `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              ADD COLUMN `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
        
        $pdo->exec($addTimestampQuery);
        $response['messages'][] = "✓ Added CreatedAt and UpdatedAt timestamp columns";
    } else {
        $response['messages'][] = "✓ Timestamp columns already exist";
    }
    
    // 4. Update existing admin to Super Admin
    $updateAdminQuery = "UPDATE `Admin` SET `Type` = 'Super Admin' WHERE `AdminID` = 1 OR `Email` = 'owner'";
    $stmt = $pdo->prepare($updateAdminQuery);
    $stmt->execute();
    $updatedRows = $stmt->rowCount();
    $response['messages'][] = "✓ Updated {$updatedRows} existing admin(s) to Super Admin role";
    
    // 5. Verify the changes
    $describeQuery = "DESCRIBE Admin";
    $stmt = $pdo->prepare($describeQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['messages'][] = "✓ Admin table structure updated successfully";
    $response['table_structure'] = $columns;
    
    $response['success'] = true;
    $response['messages'][] = "🎉 Admin role migration completed successfully!";
    
} catch (PDOException $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Migration failed: " . $e->getMessage();
}

echo json_encode($response);
?>