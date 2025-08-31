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
    
    // Get daily finance data for the last 6 days
    $query = "
        SELECT 
            DATE_FORMAT(p.PayDate, '%d') as day,
            DATE_FORMAT(p.PayDate, '%Y-%m-%d') as fullDate,
            SUM(p.Amount) as value
        FROM Payment p
        JOIN `Order` o ON p.OrderID = o.OrderID
        WHERE p.PayDate >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND o.status = 'confirmed'
        GROUP BY DATE_FORMAT(p.PayDate, '%Y-%m-%d'), DATE_FORMAT(p.PayDate, '%d')
        ORDER BY fullDate ASC
    ";
    
    // Debug query to see recent payments
    $debugQuery = "
        SELECT 
            p.PayDate,
            p.Amount,
            o.status
        FROM Payment p
        JOIN `Order` o ON p.OrderID = o.OrderID
        ORDER BY p.PayDate DESC
        LIMIT 10
    ";
    
    $debugStmt = $pdo->prepare($debugQuery);
    $debugStmt->execute();
    $debugResults = $debugStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fill in missing days with zero values
    $financeData = [];
    $currentDate = new DateTime();
    $currentDate->sub(new DateInterval('P6D'));
    
    for ($i = 0; $i < 6; $i++) {
        $dayKey = $currentDate->format('Y-m-d');
        $dayName = $currentDate->format('d');
        
        // Find data for this day
        $found = false;
        foreach ($results as $result) {
            if ($result['fullDate'] === $dayKey) {
                $financeData[] = [
                    'day' => $dayName,
                    'value' => (int)$result['value']
                ];
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $financeData[] = [
                'day' => $dayName,
                'value' => 0
            ];
        }
        
        $currentDate->add(new DateInterval('P1D'));
    }
    
    echo json_encode([
        'success' => true,
        'data' => $financeData,
        'debug' => [
            'rawResults' => $results,
            'recentPayments' => $debugResults,
            'currentDate' => date('Y-m-d'),
            'sixDaysAgo' => date('Y-m-d', strtotime('-6 days'))
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>