<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    // $pdo is already created in database.php
    
    // Get sales data by category
    $salesByCategoryQuery = "
        SELECT 
            c.CategoryName,
            SUM(oi.Quantity) as total_quantity,
            SUM(oi.Quantity * oi.unitPrice) as total_sales
        FROM OrderItem oi
        JOIN Product p ON oi.ProductID = p.ProductID
        JOIN Categories c ON p.CategoryID = c.CategoryID
        GROUP BY c.CategoryID, c.CategoryName
        ORDER BY total_quantity DESC
    ";
    
    $stmt = $pdo->query($salesByCategoryQuery);
    $salesData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data for the chart
    $chartData = [];
    foreach ($salesData as $row) {
        $chartData[] = [
            'category' => $row['CategoryName'],
            'sales' => (int)$row['total_quantity'],
            'revenue' => (float)$row['total_sales']
        ];
    }
    
    $response = [
        'success' => true,
        'data' => $chartData
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