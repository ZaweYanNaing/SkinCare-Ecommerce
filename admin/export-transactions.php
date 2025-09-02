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
    $format = isset($_GET['format']) ? $_GET['format'] : 'csv';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $dateFrom = isset($_GET['dateFrom']) ? $_GET['dateFrom'] : '';
    $dateTo = isset($_GET['dateTo']) ? $_GET['dateTo'] : '';
    
    // Build the WHERE clause
    $whereConditions = [];
    $params = [];
    
    if (!empty($search)) {
        $whereConditions[] = "(c.CName LIKE ? OR c.CEmail LIKE ? OR o.OrderID LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($status)) {
        $whereConditions[] = "o.status = ?";
        $params[] = $status;
    }
    
    if (!empty($dateFrom)) {
        $whereConditions[] = "DATE(o.orderDate) >= ?";
        $params[] = $dateFrom;
    }
    
    if (!empty($dateTo)) {
        $whereConditions[] = "DATE(o.orderDate) <= ?";
        $params[] = $dateTo;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get transactions for export
    $query = "
        SELECT 
            o.OrderID,
            o.orderDate,
            o.status,
            c.CID as customerID,
            c.CName as customerName,
            c.CEmail as customerEmail,
            c.CPhone as customerPhone,
            c.Address as customerAddress,
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
        $whereClause
        GROUP BY o.OrderID, o.orderDate, o.status, c.CID, c.CName, c.CEmail, c.CPhone, c.Address,
                 p.PaymentID, p.Amount, p.paymentMethod, p.PayDate, p.tranID
        ORDER BY o.orderDate DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data based on export format
    switch ($format) {
        case 'csv':
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="transactions-' . date('Y-m-d') . '.csv"');
            
            $output = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($output, [
                'Order ID',
                'Order Date',
                'Status',
                'Customer Name',
                'Customer Email',
                'Customer Phone',
                'Customer Address',
                'Payment Method',
                'Transaction ID',
                'Total Amount',
                'Payment Date',
                'Item Count',
                'Items'
            ]);
            
            // CSV data
            foreach ($transactions as $transaction) {
                fputcsv($output, [
                    $transaction['OrderID'],
                    $transaction['orderDate'],
                    $transaction['status'],
                    $transaction['customerName'],
                    $transaction['customerEmail'],
                    $transaction['customerPhone'],
                    $transaction['customerAddress'],
                    $transaction['paymentMethod'],
                    $transaction['tranID'],
                    $transaction['totalAmount'],
                    $transaction['PayDate'],
                    $transaction['itemCount'],
                    $transaction['items']
                ]);
            }
            
            fclose($output);
            break;
            
        case 'excel':
            // For Excel, we'll return JSON and let the frontend handle it
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $transactions,
                'format' => 'excel',
                'filename' => 'transactions-' . date('Y-m-d') . '.xlsx'
            ]);
            break;
            
        case 'pdf':
            // For PDF, we'll return JSON and let the frontend handle it
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $transactions,
                'format' => 'pdf',
                'filename' => 'transactions-' . date('Y-m-d') . '.pdf'
            ]);
            break;
            
        default:
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Unsupported export format'
            ]);
            break;
    }
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error exporting transactions: ' . $e->getMessage()
    ]);
}
?>
