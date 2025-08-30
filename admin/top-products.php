<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    // $pdo is already created in database.php
    
    // Get top 5 products by sales quantity and revenue
    $topProductsQuery = "
        SELECT 
            p.Name,
            SUM(oi.Quantity) as total_orders,
            SUM(oi.Quantity * oi.unitPrice) as total_revenue
        FROM OrderItem oi
        JOIN Product p ON oi.ProductID = p.ProductID
        GROUP BY oi.ProductID, p.Name
        ORDER BY total_orders DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($topProductsQuery);
    $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data for the recent sales component
    $salesData = [];
    $rank = 1;
    foreach ($topProducts as $product) {
        $salesData[] = [
            'rank' => $rank,
            'orders' => (int)$product['total_orders'],
            'amount' => '$' . number_format($product['total_revenue']),
            'product' => $product['Name']
        ];
        $rank++;
    }
    
    $response = [
        'success' => true,
        'data' => $salesData
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>