<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config/database.php';

// This script can be called with GET parameters for easy testing
// Example: http://localhost/test-update-direct.php?id=1&name=TestName&phone=123456789

$userId = $_GET['id'] ?? $_POST['id'] ?? 1;
$name = $_GET['name'] ?? $_POST['name'] ?? 'Test Update ' . date('H:i:s');
$phone = $_GET['phone'] ?? $_POST['phone'] ?? '09999999999';
$address = $_GET['address'] ?? $_POST['address'] ?? 'Test Address';
$gender = $_GET['gender'] ?? $_POST['gender'] ?? 1;
$skinType = $_GET['skinType'] ?? $_POST['skinType'] ?? 'Combination';

try {
    echo json_encode([
        'message' => 'Starting update test',
        'userId' => $userId,
        'data' => [
            'name' => $name,
            'phone' => $phone,
            'address' => $address,
            'gender' => $gender,
            'skinType' => $skinType
        ]
    ]) . "\n";

    // Check if user exists
    $checkStmt = $pdo->prepare("SELECT * FROM Customer WHERE CID = ?");
    $checkStmt->execute([$userId]);
    $userBefore = $checkStmt->fetch();
    
    if (!$userBefore) {
        echo json_encode(['error' => 'User not found with ID: ' . $userId]) . "\n";
        exit;
    }
    
    echo json_encode(['message' => 'User found', 'userBefore' => $userBefore]) . "\n";
    
    // Perform update
    $stmt = $pdo->prepare("
        UPDATE Customer 
        SET CName = ?, CPhone = ?, Address = ?, Gender = ?, SkinType = ? 
        WHERE CID = ?
    ");
    
    $result = $stmt->execute([$name, $phone, $address, $gender, $skinType, $userId]);
    $rowsAffected = $stmt->rowCount();
    
    echo json_encode([
        'message' => 'Update executed',
        'result' => $result,
        'rowsAffected' => $rowsAffected
    ]) . "\n";
    
    // Get updated data
    $checkStmt = $pdo->prepare("SELECT * FROM Customer WHERE CID = ?");
    $checkStmt->execute([$userId]);
    $userAfter = $checkStmt->fetch();
    
    echo json_encode([
        'message' => 'Update complete',
        'success' => $result && $rowsAffected > 0,
        'userAfter' => $userAfter
    ]) . "\n";
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]) . "\n";
} catch (Exception $e) {
    echo json_encode(['error' => 'General error: ' . $e->getMessage()]) . "\n";
}
?>