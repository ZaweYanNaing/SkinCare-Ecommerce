<?php
// Setup script to create demo admin accounts for testing
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';
require_once '../utils/admin-permissions.php';

try {
    $response = ['success' => false, 'messages' => []];
    
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
    
    foreach ($demoAdmins as $admin) {
        // Check if admin already exists
        $checkStmt = $pdo->prepare("SELECT AdminID FROM Admin WHERE Email = ?");
        $checkStmt->execute([$admin['email']]);
        
        if ($checkStmt->fetch()) {
            $existing++;
            $response['messages'][] = "✓ Admin {$admin['email']} already exists";
            continue;
        }
        
        // Create new admin
        $hashedPassword = password_hash($admin['password'], PASSWORD_DEFAULT);
        $roleDescription = getRoleDescription($admin['role']);
        
        $insertStmt = $pdo->prepare("INSERT INTO Admin (Type, Email, Password, RoleDescription) VALUES (?, ?, ?, ?)");
        $result = $insertStmt->execute([
            $admin['role'],
            $admin['email'],
            $hashedPassword,
            $roleDescription
        ]);
        
        if ($result) {
            $created++;
            $response['messages'][] = "✓ Created {$admin['role']}: {$admin['email']}";
        } else {
            $response['messages'][] = "❌ Failed to create {$admin['email']}";
        }
    }
    
    // Summary
    $response['messages'][] = "";
    $response['messages'][] = "📊 Summary:";
    $response['messages'][] = "• Created: {$created} new admin accounts";
    $response['messages'][] = "• Existing: {$existing} admin accounts";
    $response['messages'][] = "";
    $response['messages'][] = "🔑 Login Credentials:";
    $response['messages'][] = "• All accounts use password: admin123";
    $response['messages'][] = "• Access admin login at: /admin/login";
    
    $response['success'] = true;
    $response['created'] = $created;
    $response['existing'] = $existing;
    
} catch (PDOException $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Database error: " . $e->getMessage();
} catch (Exception $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Error: " . $e->getMessage();
}

echo json_encode($response);
?>