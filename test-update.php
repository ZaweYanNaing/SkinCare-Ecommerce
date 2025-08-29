<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'config/database.php';

try {
    // Test updating user ID 1
    $userId = 1;
    $testName = "Test User Updated " . date('H:i:s');
    
    echo "Testing update for user ID: $userId\n";
    
    // First, get current data
    $stmt = $pdo->prepare("SELECT * FROM Customer WHERE CID = ?");
    $stmt->execute([$userId]);
    $beforeUpdate = $stmt->fetch();
    
    if (!$beforeUpdate) {
        echo "User not found!\n";
        exit;
    }
    
    echo "Before update:\n";
    echo json_encode($beforeUpdate, JSON_PRETTY_PRINT) . "\n";
    
    // Perform update
    $stmt = $pdo->prepare("
        UPDATE Customer 
        SET CName = ?, CPhone = ?, Address = ?, Gender = ?, SkinType = ? 
        WHERE CID = ?
    ");
    
    $result = $stmt->execute([
        $testName,
        '09999999999',
        'Test Address Updated',
        1,
        'Combination',
        $userId
    ]);
    
    $rowsAffected = $stmt->rowCount();
    
    echo "Update result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
    echo "Rows affected: $rowsAffected\n";
    
    // Get updated data
    $stmt = $pdo->prepare("SELECT * FROM Customer WHERE CID = ?");
    $stmt->execute([$userId]);
    $afterUpdate = $stmt->fetch();
    
    echo "After update:\n";
    echo json_encode($afterUpdate, JSON_PRETTY_PRINT) . "\n";
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>