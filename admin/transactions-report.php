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
    // $pdo is already created in database.php
    
    // Get top 5 customers by total purchase amount
    $query = "
        SELECT 
            ROW_NUMBER() OVER (ORDER BY SUM(p.Amount) DESC) as no,
            c.CName as customer,
            CONCAT('$', FORMAT(SUM(p.Amount), 0)) as amount,
            COUNT(DISTINCT o.OrderID) as orders,
            MAX(p.PayDate) as payDate
        FROM Payment p
        JOIN `Order` o ON p.OrderID = o.OrderID
        JOIN Customer c ON o.customerID = c.CID
        WHERE o.status = 'confirmed'
        GROUP BY c.CID, c.CName
        ORDER BY SUM(p.Amount) DESC
        LIMIT 5
    ";
    
    $params = [];
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $results,
        'debug' => [
            'query' => $query,
            'params' => $params,
            'currentDate' => date('Y-m-d')
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>