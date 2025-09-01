<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Get all customers for notification targeting
    $query = "
        SELECT 
            CID,
            CName,
            CEmail,
            CPhone,
            Address,
            SkinType,
            (SELECT COUNT(*) FROM `Order` WHERE customerID = c.CID) as total_orders,
            (SELECT MAX(orderDate) FROM `Order` WHERE customerID = c.CID) as last_order_date
        FROM Customer c
        ORDER BY CName ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $customers]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>