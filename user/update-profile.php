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
    // Get raw input
    $rawInput = file_get_contents('php://input');
    error_log("Raw input: " . $rawInput);
    
    $input = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input: ' . json_last_error_msg()]);
        exit;
    }
    
    error_log("Parsed input: " . print_r($input, true));
    
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
        // First check if user exists
        $checkStmt = $pdo->prepare("SELECT CID FROM Customer WHERE CID = ?");
        $checkStmt->execute([$userId]);
        $userExists = $checkStmt->fetch();
        
        if (!$userExists) {
            echo json_encode(['success' => false, 'message' => 'User not found with ID: ' . $userId]);
            exit;
        }
        
        // Update the user
        $stmt = $pdo->prepare("
            UPDATE Customer 
            SET CName = ?, CPhone = ?, Address = ?, Gender = ?, SkinType = ? 
            WHERE CID = ?
        ");
        
        $result = $stmt->execute([$name, $phone, $address, $gender, $skinType, $userId]);
        $rowsAffected = $stmt->rowCount();
        
        error_log("Update result: " . ($result ? 'true' : 'false') . ", Rows affected: " . $rowsAffected);
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Profile updated successfully',
                'rowsAffected' => $rowsAffected,
                'updatedData' => [
                    'CID' => $userId,
                    'CName' => $name,
                    'CPhone' => $phone,
                    'Address' => $address,
                    'Gender' => $gender,
                    'SkinType' => $skinType
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Received: ' . $_SERVER['REQUEST_METHOD']]);
}
?>