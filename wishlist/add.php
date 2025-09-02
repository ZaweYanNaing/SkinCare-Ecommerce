<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['UserID'] ?? null;
    $productId = $input['ProductID'] ?? null;
    
    if (!$userId || !$productId) {
        echo json_encode(['success' => false, 'message' => 'User ID and Product ID are required']);
        exit;
    }

    // Check customer status before allowing wishlist actions
    $statusStmt = $pdo->prepare("SELECT Status FROM Customer WHERE CID = ?");
    $statusStmt->execute([$userId]);
    $customer = $statusStmt->fetch();

    if (!$customer) {
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
        exit;
    }

    if ($customer['Status'] === 'banned') {
        echo json_encode([
            'success' => false, 
            'message' => 'Your account has been banned and cannot modify wishlist. Please contact customer support.',
            'error_code' => 'ACCOUNT_BANNED'
        ]);
        exit;
    }
    
    try {
        // Check if item already exists in wishlist
        $checkStmt = $pdo->prepare("SELECT wishlistID FROM WishList WHERE CustomerID = ? AND ProductID = ?");
        $checkStmt->execute([$userId, $productId]);
        
        if ($checkStmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Item already in wishlist']);
            exit;
        }
        
        // Add to wishlist
        $stmt = $pdo->prepare("INSERT INTO WishList (CustomerID, ProductID) VALUES (?, ?)");
        $result = $stmt->execute([$userId, $productId]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Added to wishlist successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add to wishlist']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>