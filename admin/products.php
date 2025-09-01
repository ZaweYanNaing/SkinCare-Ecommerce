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
            if (isset($_GET['id'])) {
                // Get single product
                $stmt = $pdo->prepare("
                    SELECT p.*, c.CategoryName 
                    FROM Product p 
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID 
                    WHERE p.ProductID = ?
                ");
                $stmt->execute([$_GET['id']]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($product) {
                    echo json_encode(['success' => true, 'data' => $product]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Product not found']);
                }
            } else {
                // Get all products with categories
                $stmt = $pdo->prepare("
                    SELECT 
                        p.ProductID,
                        p.Name,
                        p.Description,
                        p.Price,
                        p.Stock,
                        p.ForSkinType,
                        p.Image,
                        c.CategoryName,
                        p.CategoryID,
                        CASE 
                            WHEN p.Stock = 0 THEN 'Out of Stock'
                            WHEN p.Stock <= 5 THEN 'Low Stock'
                            ELSE 'Active'
                        END as Status
                    FROM Product p 
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID 
                    ORDER BY p.ProductID DESC
                ");
                $stmt->execute();
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $products]);
            }
            break;
            
        case 'POST':
            // Create new product
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                INSERT INTO Product (Name, Description, Price, Stock, ForSkinType, CategoryID, Image) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $input['name'],
                $input['description'],
                $input['price'],
                $input['stock'],
                $input['forSkinType'],
                $input['categoryId'],
                $input['image'] ?? null
            ]);
            
            if ($result) {
                $productId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Product created successfully', 'productId' => $productId]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create product']);
            }
            break;
            
        case 'PUT':
            // Update product
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                UPDATE Product 
                SET Name = ?, Description = ?, Price = ?, Stock = ?, ForSkinType = ?, CategoryID = ?, Image = ?
                WHERE ProductID = ?
            ");
            
            $result = $stmt->execute([
                $input['name'],
                $input['description'],
                $input['price'],
                $input['stock'],
                $input['forSkinType'],
                $input['categoryId'],
                $input['image'],
                $input['id']
            ]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update product']);
            }
            break;
            
        case 'DELETE':
            // Delete product
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("DELETE FROM Product WHERE ProductID = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
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