<?php
// Simplified demo admin creation script
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $response = ['success' => false, 'messages' => []];
    
    // Check if Admin table has the required columns
    $describeQuery = "DESCRIBE Admin";
    $stmt = $pdo->prepare($describeQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasRoleDescription = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'RoleDescription') {
            $hasRoleDescription = true;
            break;
        }
    }
    
    $response['messages'][] = "📋 Admin table columns available:";
    foreach ($columns as $column) {
        $response['messages'][] = "  - {$column['Field']}: {$column['Type']}";
    }
    $response['messages'][] = "";
    
    // Demo admin accounts to create
    $demoAdmins = [
        [
            'email' => 'owner',
            'password' => 'admin123',
            'role' => 'Super Admin'
        ],
        [
            'email' => 'manager@skincare.com',
            'password' => 'admin123',
            'role' => 'Manager'
        ],
        [
            'email' => 'staff@skincare.com',
            'password' => 'admin123',
            'role' => 'Staff'
        ],
        [
            'email' => 'expert@skincare.com',
            'password' => 'admin123',
            'role' => 'Expert'
        ]
    ];
    
    $created = 0;
    $existing = 0;
    $updated = 0;
    
    foreach ($demoAdmins as $admin) {
        // Check if admin already exists
        $checkStmt = $pdo->prepare("SELECT AdminID, Type FROM Admin WHERE Email = ?");
        $checkStmt->execute([$admin['email']]);
        $existingAdmin = $checkStmt->fetch();
        
        if ($existingAdmin) {
            // Update existing admin
            $hashedPassword = password_hash($admin['password'], PASSWORD_DEFAULT);
            
            if ($hasRoleDescription) {
                $roleDescription = getRoleDescription($admin['role']);
                $updateStmt = $pdo->prepare("UPDATE Admin SET Type = ?, Password = ?, RoleDescription = ? WHERE Email = ?");
                $updateStmt->execute([$admin['role'], $hashedPassword, $roleDescription, $admin['email']]);
            } else {
                $updateStmt = $pdo->prepare("UPDATE Admin SET Type = ?, Password = ? WHERE Email = ?");
                $updateStmt->execute([$admin['role'], $hashedPassword, $admin['email']]);
            }
            
            $updated++;
            $response['messages'][] = "✓ Updated {$admin['role']}: {$admin['email']}";
            continue;
        }
        
        // Create new admin
        $hashedPassword = password_hash($admin['password'], PASSWORD_DEFAULT);
        
        try {
            if ($hasRoleDescription) {
                $roleDescription = getRoleDescription($admin['role']);
                $insertStmt = $pdo->prepare("INSERT INTO Admin (Type, Email, Password, RoleDescription) VALUES (?, ?, ?, ?)");
                $result = $insertStmt->execute([$admin['role'], $admin['email'], $hashedPassword, $roleDescription]);
            } else {
                $insertStmt = $pdo->prepare("INSERT INTO Admin (Type, Email, Password) VALUES (?, ?, ?)");
                $result = $insertStmt->execute([$admin['role'], $admin['email'], $hashedPassword]);
            }
            
            if ($result) {
                $created++;
                $response['messages'][] = "✓ Created {$admin['role']}: {$admin['email']}";
            } else {
                $response['messages'][] = "❌ Failed to create {$admin['email']}";
            }
        } catch (PDOException $e) {
            $response['messages'][] = "❌ Error creating {$admin['email']}: " . $e->getMessage();
        }
    }
    
    // Summary
    $response['messages'][] = "";
    $response['messages'][] = "📊 Summary:";
    $response['messages'][] = "• Created: {$created} new admin accounts";
    $response['messages'][] = "• Updated: {$updated} existing admin accounts";
    $response['messages'][] = "";
    $response['messages'][] = "🔑 Login Credentials:";
    $response['messages'][] = "• All accounts use password: admin123";
    $response['messages'][] = "• Access admin login at: /admin/login";
    $response['messages'][] = "";
    $response['messages'][] = "👥 Available Accounts:";
    foreach ($demoAdmins as $admin) {
        $response['messages'][] = "• {$admin['role']}: {$admin['email']}";
    }
    
    $response['success'] = true;
    $response['created'] = $created;
    $response['updated'] = $updated;
    
} catch (PDOException $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Database error: " . $e->getMessage();
} catch (Exception $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Error: " . $e->getMessage();
}

// Helper function for role descriptions
function getRoleDescription($role) {
    $descriptions = [
        'Super Admin' => 'Full system access - can manage all aspects including admin accounts',
        'Manager' => 'Management access - can handle products, orders, and customers but cannot create new admins',
        'Staff' => 'Limited access - can view orders, customers, and reports but cannot manage accounts or products',
        'Expert' => 'Specialized access - can update products and manage customers with reporting capabilities'
    ];
    
    return $descriptions[$role] ?? 'Admin user';
}

echo json_encode($response);
?>