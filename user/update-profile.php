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
    
    $userId = $input['CID'] ?? null;
    $name = $input['CName'] ?? null;
    $phone = $input['CPhone'] ?? null;
    $address = $input['Address'] ?? null;
    $gender = $input['Gender'] ?? null;
    $skinType = $input['SkinType'] ?? null;
    
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE Customer 
            SET CName = ?, CPhone = ?, Address = ?, Gender = ?, SkinType = ? 
            WHERE CID = ?
        ");
        
        $result = $stmt->execute([$name, $phone, $address, $gender, $skinType, $userId]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>