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
    
    // Get all monthly sales data and take the most recent 6 months
    $query = "
        SELECT 
            DATE_FORMAT(o.orderDate, '%b') as month,
            DATE_FORMAT(o.orderDate, '%Y-%m') as yearMonth,
            SUM(p.Amount) as sales,
            COUNT(DISTINCT o.OrderID) as orders
        FROM `Order` o
        JOIN Payment p ON o.OrderID = p.OrderID
        WHERE o.status = 'confirmed'
        GROUP BY DATE_FORMAT(o.orderDate, '%Y-%m'), DATE_FORMAT(o.orderDate, '%b')
        ORDER BY yearMonth DESC
        LIMIT 6
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Reverse the results to show chronological order and format the data
    $monthsData = [];
    $reversedResults = array_reverse($results);
    
    foreach ($reversedResults as $result) {
        $monthsData[] = [
            'month' => $result['month'],
            'sales' => (int)$result['sales'],
            'orders' => (int)$result['orders']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $monthsData,
        'debug' => [
            'rawResults' => $results,
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