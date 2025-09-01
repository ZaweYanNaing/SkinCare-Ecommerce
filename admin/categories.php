<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all categories
            $stmt = $pdo->prepare("SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName");
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $categories]);
            break;
            
        case 'POST':
            // Create new category
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Check if category already exists
            $checkStmt = $pdo->prepare("SELECT CategoryID FROM Categories WHERE CategoryName = ?");
            $checkStmt->execute([$input['categoryName']]);
            
            if ($checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Category already exists']);
                break;
            }
            
            $stmt = $pdo->prepare("INSERT INTO Categories (CategoryName) VALUES (?)");
            $result = $stmt->execute([$input['categoryName']]);
            
            if ($result) {
                $categoryId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Category created successfully', 'categoryId' => $categoryId]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create category']);
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