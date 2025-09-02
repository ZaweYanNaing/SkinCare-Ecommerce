<?php
// Fixed migration script to handle existing admin data properly
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $response = ['success' => false, 'messages' => []];
    
    // First, let's see what's in the current Admin table
    $describeQuery = "DESCRIBE Admin";
    $stmt = $pdo->prepare($describeQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['messages'][] = "📋 Current Admin table structure:";
    foreach ($columns as $column) {
        $response['messages'][] = "  - {$column['Field']}: {$column['Type']}";
    }
    
    // Check current admin data
    $dataQuery = "SELECT AdminID, Type, Email FROM Admin";
    $stmt = $pdo->prepare($dataQuery);
    $stmt->execute();
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['messages'][] = "";
    $response['messages'][] = "👥 Current admin data:";
    foreach ($admins as $admin) {
        $response['messages'][] = "  - ID: {$admin['AdminID']}, Type: '{$admin['Type']}', Email: {$admin['Email']}";
    }
    
    // Step 1: Update existing admin data to match ENUM values
    $response['messages'][] = "";
    $response['messages'][] = "🔄 Step 1: Updating existing admin data...";
    
    // Map old values to new ENUM values
    $typeMapping = [
        'zawe' => 'Super Admin',
        'owner' => 'Super Admin',
        'admin' => 'Super Admin',
        'manager' => 'Manager',
        'staff' => 'Staff',
        'expert' => 'Expert'
    ];
    
    foreach ($admins as $admin) {
        $oldType = $admin['Type'];
        $newType = $typeMapping[$oldType] ?? 'Super Admin'; // Default to Super Admin
        
        if ($oldType !== $newType) {
            $updateStmt = $pdo->prepare("UPDATE Admin SET Type = ? WHERE AdminID = ?");
            $updateStmt->execute([$newType, $admin['AdminID']]);
            $response['messages'][] = "  ✓ Updated Admin ID {$admin['AdminID']}: '{$oldType}' → '{$newType}'";
        } else {
            $response['messages'][] = "  ✓ Admin ID {$admin['AdminID']}: '{$oldType}' already correct";
        }
    }
    
    // Step 2: Add RoleDescription column if it doesn't exist
    $response['messages'][] = "";
    $response['messages'][] = "🔄 Step 2: Adding RoleDescription column...";
    
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
        $response['messages'][] = "  ✓ Added RoleDescription column";
    } else {
        $response['messages'][] = "  ✓ RoleDescription column already exists";
    }
    
    // Step 3: Add timestamp columns if they don't exist
    $response['messages'][] = "";
    $response['messages'][] = "🔄 Step 3: Adding timestamp columns...";
    
    $checkTimestampQuery = "SHOW COLUMNS FROM Admin LIKE 'CreatedAt'";
    $stmt = $pdo->prepare($checkTimestampQuery);
    $stmt->execute();
    $timestampExists = $stmt->fetch();
    
    if (!$timestampExists) {
        $addTimestampQuery = "ALTER TABLE `Admin` 
                              ADD COLUMN `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              ADD COLUMN `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
        
        $pdo->exec($addTimestampQuery);
        $response['messages'][] = "  ✓ Added CreatedAt and UpdatedAt timestamp columns";
    } else {
        $response['messages'][] = "  ✓ Timestamp columns already exist";
    }
    
    // Step 4: Now safely modify the Type column to ENUM
    $response['messages'][] = "";
    $response['messages'][] = "🔄 Step 4: Converting Type column to ENUM...";
    
    try {
        $alterTypeQuery = "ALTER TABLE `Admin` 
                           MODIFY COLUMN `Type` ENUM('Super Admin', 'Manager', 'Staff', 'Expert') NOT NULL DEFAULT 'Staff'
                           COMMENT 'Admin role: Super Admin=full access, Manager=no admin creation, Staff=no account/product mgmt, Expert=specialized access'";
        
        $pdo->exec($alterTypeQuery);
        $response['messages'][] = "  ✓ Successfully converted Type column to ENUM";
    } catch (PDOException $e) {
        $response['messages'][] = "  ❌ Failed to convert Type column: " . $e->getMessage();
        throw $e;
    }
    
    // Step 5: Update role descriptions
    $response['messages'][] = "";
    $response['messages'][] = "🔄 Step 5: Updating role descriptions...";
    
    $roleDescriptions = [
        'Super Admin' => 'Full system access - can manage all aspects including admin accounts',
        'Manager' => 'Management access - can handle products, orders, and customers but cannot create new admins',
        'Staff' => 'Limited access - can view orders, customers, and reports but cannot manage accounts or products',
        'Expert' => 'Specialized access - can update products and manage customers with reporting capabilities'
    ];
    
    foreach ($roleDescriptions as $role => $description) {
        $updateDescStmt = $pdo->prepare("UPDATE Admin SET RoleDescription = ? WHERE Type = ? AND (RoleDescription IS NULL OR RoleDescription = '')");
        $updateDescStmt->execute([$description, $role]);
        $affected = $updateDescStmt->rowCount();
        if ($affected > 0) {
            $response['messages'][] = "  ✓ Updated {$affected} admin(s) with {$role} description";
        }
    }
    
    // Step 6: Verify the final structure
    $response['messages'][] = "";
    $response['messages'][] = "🔍 Final verification:";
    
    $finalDescribeQuery = "DESCRIBE Admin";
    $stmt = $pdo->prepare($finalDescribeQuery);
    $stmt->execute();
    $finalColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($finalColumns as $column) {
        $response['messages'][] = "  ✓ {$column['Field']}: {$column['Type']} (Default: {$column['Default']})";
    }
    
    // Check final admin data
    $finalDataQuery = "SELECT AdminID, Type, Email, RoleDescription FROM Admin";
    $stmt = $pdo->prepare($finalDataQuery);
    $stmt->execute();
    $finalAdmins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['messages'][] = "";
    $response['messages'][] = "👥 Final admin data:";
    foreach ($finalAdmins as $admin) {
        $response['messages'][] = "  ✓ {$admin['Email']} ({$admin['Type']})";
    }
    
    $response['success'] = true;
    $response['messages'][] = "";
    $response['messages'][] = "🎉 Admin role migration completed successfully!";
    
} catch (PDOException $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Migration failed: " . $e->getMessage();
} catch (Exception $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Error: " . $e->getMessage();
}

echo json_encode($response);
?>