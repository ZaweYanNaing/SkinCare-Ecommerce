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
            // Get all expert accounts
            $query = "
                SELECT 
                    ExpertID,
                    Name,
                    Email,
                    Specialization,
                    Bio,
                    Status,
                    CreatedAt
                FROM Expert
                ORDER BY Name ASC
            ";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $experts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $experts]);
            break;
            
        case 'POST':
            // Create new expert account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (empty($input['name']) || empty($input['email']) || empty($input['specialization']) || empty($input['password'])) {
                echo json_encode(['success' => false, 'message' => 'Name, email, specialization, and password are required']);
                break;
            }
            
            // Check if email already exists
            $checkStmt = $pdo->prepare("SELECT ExpertID FROM Expert WHERE Email = ?");
            $checkStmt->execute([$input['email']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                break;
            }
            
            // Hash password
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO Expert (Name, Email, Specialization, Bio, Password, Status) VALUES (?, ?, ?, ?, ?, 'active')");
            $result = $stmt->execute([
                $input['name'],
                $input['email'],
                $input['specialization'],
                $input['bio'] ?? '',
                $hashedPassword
            ]);
            
            if ($result) {
                $expertId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Expert account created successfully', 'expertId' => $expertId]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create expert account']);
            }
            break;        
    
        case 'PUT':
            // Update expert account
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (empty($input['name']) || empty($input['email']) || empty($input['specialization'])) {
                echo json_encode(['success' => false, 'message' => 'Name, email, and specialization are required']);
                break;
            }
            
            // Check if email already exists for other experts
            $checkStmt = $pdo->prepare("SELECT ExpertID FROM Expert WHERE Email = ? AND ExpertID != ?");
            $checkStmt->execute([$input['email'], $input['id']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                break;
            }
            
            if (!empty($input['password'])) {
                // Update with new password
                $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE Expert SET Name = ?, Email = ?, Specialization = ?, Bio = ?, Password = ? WHERE ExpertID = ?");
                $result = $stmt->execute([
                    $input['name'],
                    $input['email'],
                    $input['specialization'],
                    $input['bio'] ?? '',
                    $hashedPassword,
                    $input['id']
                ]);
            } else {
                // Update without changing password
                $stmt = $pdo->prepare("UPDATE Expert SET Name = ?, Email = ?, Specialization = ?, Bio = ? WHERE ExpertID = ?");
                $result = $stmt->execute([
                    $input['name'],
                    $input['email'],
                    $input['specialization'],
                    $input['bio'] ?? '',
                    $input['id']
                ]);
            }
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Expert account updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update expert account']);
            }
            break;
            
        case 'DELETE':
            // Delete expert account
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("DELETE FROM Expert WHERE ExpertID = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Expert account deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Expert account not found']);
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