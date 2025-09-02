<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    // Test database connection
    echo "Testing database connection...\n";
    
    // Simple query to test
    $testQuery = "SELECT COUNT(*) as count FROM `Order`";
    $stmt = $pdo->prepare($testQuery);
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo "Total orders in database: " . $result['count'] . "\n";
    
    // Test the main query
    $query = "
        SELECT 
            o.OrderID,
            o.orderDate,
            o.status,
            c.CID as customerID,
            c.CName as customerName,
            c.CEmail as customerEmail,
            c.CPhone as customerPhone,
            p.PaymentID,
            p.Amount as totalAmount,
            p.paymentMethod,
            p.PayDate,
            p.tranID,
            COUNT(oi.ID) as itemCount,
            GROUP_CONCAT(
                CONCAT(pr.Name, ' (', oi.Quantity, 'x)')
                SEPARATOR ', '
            ) as items
        FROM `Order` o
        LEFT JOIN Customer c ON o.customerID = c.CID
        LEFT JOIN Payment p ON o.OrderID = p.OrderID
        LEFT JOIN OrderItem oi ON o.OrderID = oi.OrderID
        LEFT JOIN Product pr ON oi.ProductID = pr.ProductID
        GROUP BY o.OrderID, o.orderDate, o.status, c.CID, c.CName, c.CEmail, c.CPhone, 
                 p.PaymentID, p.Amount, p.paymentMethod, p.PayDate, p.tranID
        ORDER BY o.orderDate DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Test successful',
        'data' => $transactions,
        'count' => count($transactions)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
?>