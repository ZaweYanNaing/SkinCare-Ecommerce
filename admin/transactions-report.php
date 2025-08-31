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
    
    // Get filter date from query parameter
    $filterDate = isset($_GET['date']) ? $_GET['date'] : null;
    
    $query = "
        SELECT 
            p.PaymentID as no,
            c.CName as customer,
            CONCAT('$', FORMAT(p.Amount, 0)) as amount,
            p.paymentMethod as payment,
            p.PayDate as payDate
        FROM Payment p
        JOIN `Order` o ON p.OrderID = o.OrderID
        JOIN Customer c ON o.customerID = c.CID
        WHERE o.status = 'confirmed'
    ";
    
    $params = [];
    
    // Add date filter if provided
    if ($filterDate) {
        $query .= " AND DATE(p.PayDate) = :filterDate";
        $params['filterDate'] = $filterDate;
    } else {
        // Default to last 30 days if no date filter
        $query .= " AND p.PayDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }
    
    $query .= " ORDER BY p.PayDate DESC LIMIT 10";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $results,
        'filterDate' => $filterDate,
        'debug' => [
            'query' => $query,
            'params' => $params,
            'currentDate' => date('Y-m-d'),
            'thirtyDaysAgo' => date('Y-m-d', strtotime('-30 days'))
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>