<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../utils/admin-permissions.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // For demo purposes, we'll assume admin ID is passed in headers or session
    // In production, this should come from authenticated session/JWT token
    $currentAdminId = $_SERVER['HTTP_X_ADMIN_ID'] ?? 1; // Default to admin ID 1 for demo
    
    switch ($method) {
        case 'GET':
            // Check permission to read admin accounts
            $permissionCheck = checkAdminPermission($pdo, $currentAdminId, 'admin_management', 'read');
            if (!$permissionCheck['allowed']) {
                echo json_encode([
                    'success' => false, 
                    'message' => $permissionCheck['message'],
                    'error_code' => $permissionCheck['error_code']
                ]);
                break;
            }
            
            // Get all admin accounts with role descriptions
            $query = "
                SELECT 
                    AdminID,
                    Type,
                    Email,
                    RoleDescription,
                    CreatedAt,
                    UpdatedAt
                FROM Admin
                ORDER BY AdminID ASC
            ";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Add role descriptions for display
            foreach ($admins as &$admin) {
                $admin['RoleDescription'] = $admin['RoleDescription'] ?: getRoleDescription($admin['Type']);
                $admin['Permissions'] = getRolePermissions($admin['Type']);
            }
            
            echo json_encode(['success' => true, 'data' => $admins]);
            break;
            
        case 'POST':
            // Check permission to create admin accounts
            $permissionCheck = checkAdminPermission($pdo, $currentAdminId, 'admin_management', 'create');
            if (!$permissionCheck['allowed']) {
                echo json_encode([
                    'success' => false, 
                    'message' => $permissionCheck['message'],
                    'error_code' => $permissionCheck['error_code']
                ]);
                break;
            }
            
            // Create new admin account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate role
            $validRoles = getAvailableRoles();
            if (!in_array($input['type'], $validRoles)) {
                echo json_encode(['success' => false, 'message' => 'Invalid admin role']);
                break;
            }
            
            // Check if email already exists
            $checkStmt = $pdo->prepare("SELECT AdminID FROM Admin WHERE Email = ?");
            $checkStmt->execute([$input['email']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                break;
            }
            
            // Hash password
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO Admin (Type, Email, Password, RoleDescription) VALUES (?, ?, ?, ?)");
            $result = $stmt->execute([
                $input['type'],
                $input['email'],
                $hashedPassword,
                getRoleDescription($input['type'])
            ]);
            
            if ($result) {
                $adminId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Admin account created successfully', 'adminId' => $adminId]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create admin account']);
            }
            break;
            
        case 'PUT':
            // Check permission to update admin accounts
            $permissionCheck = checkAdminPermission($pdo, $currentAdminId, 'admin_management', 'update');
            if (!$permissionCheck['allowed']) {
                echo json_encode([
                    'success' => false, 
                    'message' => $permissionCheck['message'],
                    'error_code' => $permissionCheck['error_code']
                ]);
                break;
            }
            
            // Update admin account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate role
            $validRoles = getAvailableRoles();
            if (!in_array($input['type'], $validRoles)) {
                echo json_encode(['success' => false, 'message' => 'Invalid admin role']);
                break;
            }
            
            // Check if email already exists for other admins
            $checkStmt = $pdo->prepare("SELECT AdminID FROM Admin WHERE Email = ? AND AdminID != ?");
            $checkStmt->execute([$input['email'], $input['id']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                break;
            }
            
            if (!empty($input['password'])) {
                // Update with new password
                $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE Admin SET Type = ?, Email = ?, Password = ?, RoleDescription = ? WHERE AdminID = ?");
                $result = $stmt->execute([
                    $input['type'],
                    $input['email'],
                    $hashedPassword,
                    getRoleDescription($input['type']),
                    $input['id']
                ]);
            } else {
                // Update without changing password
                $stmt = $pdo->prepare("UPDATE Admin SET Type = ?, Email = ?, RoleDescription = ? WHERE AdminID = ?");
                $result = $stmt->execute([
                    $input['type'],
                    $input['email'],
                    getRoleDescription($input['type']),
                    $input['id']
                ]);
            }
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Admin account updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update admin account']);
            }
            break;
            
        case 'DELETE':
            // Check permission to delete admin accounts
            $permissionCheck = checkAdminPermission($pdo, $currentAdminId, 'admin_management', 'delete');
            if (!$permissionCheck['allowed']) {
                echo json_encode([
                    'success' => false, 
                    'message' => $permissionCheck['message'],
                    'error_code' => $permissionCheck['error_code']
                ]);
                break;
            }
            
            // Delete admin account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Prevent deleting the last Super Admin
            $superAdminCountStmt = $pdo->prepare("SELECT COUNT(*) as super_admin_count FROM Admin WHERE Type = 'Super Admin'");
            $superAdminCountStmt->execute();
            $superAdminCount = $superAdminCountStmt->fetch(PDO::FETCH_ASSOC);
            
            // Check if trying to delete a Super Admin
            $targetAdminStmt = $pdo->prepare("SELECT Type FROM Admin WHERE AdminID = ?");
            $targetAdminStmt->execute([$input['id']]);
            $targetAdmin = $targetAdminStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($targetAdmin && $targetAdmin['Type'] === 'Super Admin' && $superAdminCount['super_admin_count'] <= 1) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete the last Super Admin account']);
                break;
            }
            
            // Prevent self-deletion
            if ($input['id'] == $currentAdminId) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete your own account']);
                break;
            }
            
            $stmt = $pdo->prepare("DELETE FROM Admin WHERE AdminID = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Admin account deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Admin account not found']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>