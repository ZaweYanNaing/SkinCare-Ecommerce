<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/admin-permissions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit();
        }
        
        $email = isset($input['email']) ? trim($input['email']) : null;
        $password = isset($input['password']) ? trim($input['password']) : null;
        
        if (!$email || !$password) {
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            exit();
        }
        
        // Check if admin exists
        $stmt = $pdo->prepare("SELECT AdminID, Type, Email, Password, RoleDescription FROM Admin WHERE Email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            exit();
        }
        
        // Verify password
        if (!password_verify($password, $admin['Password'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            exit();
        }
        
        // Update last login timestamp (if column exists)
        try {
            $updateStmt = $pdo->prepare("UPDATE Admin SET UpdatedAt = CURRENT_TIMESTAMP WHERE AdminID = ?");
            $updateStmt->execute([$admin['AdminID']]);
        } catch (PDOException $e) {
            // Column might not exist yet, ignore error
        }
        
        // Get role permissions
        $permissions = getRolePermissions($admin['Type']);
        $roleDescription = $admin['RoleDescription'] ?: getRoleDescription($admin['Type']);
        
        // Generate a simple session token (in production, use JWT or proper session management)
        $sessionToken = bin2hex(random_bytes(32));
        
        // In production, store this token in database or cache with expiration
        // For demo, we'll just return it
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'admin' => [
                'id' => $admin['AdminID'],
                'email' => $admin['Email'],
                'role' => $admin['Type'],
                'roleDescription' => $roleDescription,
                'permissions' => $permissions,
                'sessionToken' => $sessionToken
            ]
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>