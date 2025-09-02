<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetTransactions($pdo);
            break;
        case 'PUT':
            handleUpdateOrderStatus($pdo);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleGetTransactions($pdo) {
    try {
        // Test database connection first
        $testStmt = $pdo->prepare("SELECT 1");
        $testStmt->execute();
        
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $dateFrom = isset($_GET['dateFrom']) ? $_GET['dateFrom'] : '';
        $dateTo = isset($_GET['dateTo']) ? $_GET['dateTo'] : '';
        
        $offset = ($page - 1) * $limit;
        
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
        
        // Get total count
        $countQuery = "
            SELECT COUNT(DISTINCT o.OrderID) as total
            FROM `Order` o
            LEFT JOIN Customer c ON o.customerID = c.CID
            LEFT JOIN Payment p ON o.OrderID = p.OrderID
            $whereClause
        ";
        
        $countStmt = $pdo->prepare($countQuery);
        $countStmt->execute($params);
        $totalRecords = $countStmt->fetch()['total'];
        
        // Get transactions with pagination
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
            $whereClause
            GROUP BY o.OrderID, o.orderDate, o.status, c.CID, c.CName, c.CEmail, c.CPhone, 
                     p.PaymentID, p.Amount, p.paymentMethod, p.PayDate, p.tranID
            ORDER BY o.orderDate DESC
            LIMIT {$limit} OFFSET {$offset}
        ";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get summary statistics - use same calculation as overview stats
        $statsQuery = "
            SELECT 
                COUNT(DISTINCT o.OrderID) as totalOrders,
                COALESCE(SUM(p.Amount), 0) as totalRevenue,
                COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.OrderID END) as pendingOrders,
                COUNT(DISTINCT CASE WHEN o.status = 'confirmed' THEN o.OrderID END) as confirmedOrders,
                COUNT(DISTINCT CASE WHEN o.status = 'shipped' THEN o.OrderID END) as shippedOrders,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.OrderID END) as deliveredOrders,
                COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.OrderID END) as cancelledOrders
            FROM `Order` o
            LEFT JOIN Customer c ON o.customerID = c.CID
            LEFT JOIN Payment p ON o.OrderID = p.OrderID
            $whereClause
        ";
        
        $statsParams = $params; // Use the same parameters for stats query
        $statsStmt = $pdo->prepare($statsQuery);
        $statsStmt->execute($statsParams);
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $transactions,
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => ceil($totalRecords / $limit),
                'totalRecords' => $totalRecords,
                'limit' => $limit
            ],
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error fetching transactions: ' . $e->getMessage()]);
    }
}

function handleUpdateOrderStatus($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['orderId']) || !isset($input['status'])) {
            echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
            return;
        }
        
        $orderId = $input['orderId'];
        $status = $input['status'];
        
        // Validate status
        $validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid status']);
            return;
        }
        
        // Update order status
        $stmt = $pdo->prepare("UPDATE `Order` SET status = ? WHERE OrderID = ?");
        $result = $stmt->execute([$status, $orderId]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update order status']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error updating order status: ' . $e->getMessage()]);
    }
}
?>