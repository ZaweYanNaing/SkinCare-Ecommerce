<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all admin accounts
            $query = "
                SELECT 
                    AdminID,
                    Type,
                    Email,
                    NULL as CreatedDate,
                    NULL as LastLogin
                FROM Admin
                ORDER BY AdminID ASC
            ";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $admins]);
            break;
            
        case 'POST':
            // Create new admin account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Check if email already exists
            $checkStmt = $pdo->prepare("SELECT AdminID FROM Admin WHERE Email = ?");
            $checkStmt->execute([$input['email']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                break;
            }
            
            // Hash password
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO Admin (Type, Email, Password) VALUES (?, ?, ?)");
            $result = $stmt->execute([
                $input['type'],
                $input['email'],
                $hashedPassword
            ]);
            
            if ($result) {
                $adminId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Admin account created successfully', 'adminId' => $adminId]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create admin account']);
            }
            break;
            
        case 'PUT':
            // Update admin account
            $input = json_decode(file_get_contents('php://input'), true);
            
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
                $stmt = $pdo->prepare("UPDATE Admin SET Type = ?, Email = ?, Password = ? WHERE AdminID = ?");
                $result = $stmt->execute([
                    $input['type'],
                    $input['email'],
                    $hashedPassword,
                    $input['id']
                ]);
            } else {
                // Update without changing password
                $stmt = $pdo->prepare("UPDATE Admin SET Type = ?, Email = ? WHERE AdminID = ?");
                $result = $stmt->execute([
                    $input['type'],
                    $input['email'],
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
            // Delete admin account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Prevent deleting the last admin
            $countStmt = $pdo->prepare("SELECT COUNT(*) as admin_count FROM Admin");
            $countStmt->execute();
            $count = $countStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($count['admin_count'] <= 1) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete the last admin account']);
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