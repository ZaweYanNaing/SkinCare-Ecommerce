<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all customers with detailed information
            $query = "
                SELECT 
                    c.CID,
                    c.CName,
                    c.CEmail,
                    c.CPhone,
                    c.Address,
                    c.Gender,
                    c.SkinType,
                    c.Status,
                    COUNT(o.OrderID) as OrderCount,
                    COALESCE(SUM(p.Amount), 0) as TotalSpent,
                    MIN(o.orderDate) as JoinDate
                FROM Customer c
                LEFT JOIN `Order` o ON c.CID = o.customerID
                LEFT JOIN Payment p ON o.OrderID = p.OrderID
                GROUP BY c.CID, c.CName, c.CEmail, c.CPhone, c.Address, c.Gender, c.SkinType, c.Status
                ORDER BY c.CName ASC
            ";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $customers]);
            break;
            
        case 'PUT':
            // Update customer status (warning, ban, unban)
            $input = json_decode(file_get_contents('php://input'), true);
            $customerId = $input['id'];
            $action = $input['action'];
            $newStatus = $input['status'];
            
            // Validate status
            $validStatuses = ['active', 'warned', 'banned'];
            if (!in_array($newStatus, $validStatuses)) {
                echo json_encode(['success' => false, 'message' => 'Invalid status']);
                break;
            }
            
            try {
                // Update customer status
                $stmt = $pdo->prepare("UPDATE Customer SET Status = ? WHERE CID = ?");
                $result = $stmt->execute([$newStatus, $customerId]);
                
                if ($result && $stmt->rowCount() > 0) {
                    // Log the action (optional - you can add a log table later)
                    $actionMessages = [
                        'warning' => 'Customer warned successfully',
                        'ban' => 'Customer banned successfully', 
                        'unban' => 'Customer unbanned successfully'
                    ];
                    
                    $message = $actionMessages[$action] ?? 'Customer status updated successfully';
                    echo json_encode(['success' => true, 'message' => $message]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Customer not found or status unchanged']);
                }
                
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
            break;
            
        case 'DELETE':
            // Delete customer and all related data
            $input = json_decode(file_get_contents('php://input'), true);
            $customerId = $input['id'];
            
            // Start transaction
            $pdo->beginTransaction();
            
            try {
                // Delete in order: OrderItem -> Payment -> Order -> WishList -> Review -> Customer
                
                // Delete order items
                $stmt = $pdo->prepare("DELETE oi FROM OrderItem oi INNER JOIN `Order` o ON oi.OrderID = o.OrderID WHERE o.customerID = ?");
                $stmt->execute([$customerId]);
                
                // Delete payments
                $stmt = $pdo->prepare("DELETE p FROM Payment p INNER JOIN `Order` o ON p.OrderID = o.OrderID WHERE o.customerID = ?");
                $stmt->execute([$customerId]);
                
                // Delete orders
                $stmt = $pdo->prepare("DELETE FROM `Order` WHERE customerID = ?");
                $stmt->execute([$customerId]);
                
                // Delete wishlist items
                $stmt = $pdo->prepare("DELETE FROM WishList WHERE CustomerID = ?");
                $stmt->execute([$customerId]);
                
                // Delete reviews
                $stmt = $pdo->prepare("DELETE FROM Review WHERE CID = ?");
                $stmt->execute([$customerId]);
                
                // Delete notifications
                $stmt = $pdo->prepare("DELETE FROM Notification WHERE CustomerID = ?");
                $stmt->execute([$customerId]);
                
                // Finally delete customer
                $stmt = $pdo->prepare("DELETE FROM Customer WHERE CID = ?");
                $result = $stmt->execute([$customerId]);
                
                if ($result && $stmt->rowCount() > 0) {
                    $pdo->commit();
                    echo json_encode(['success' => true, 'message' => 'Customer and all related data deleted successfully']);
                } else {
                    $pdo->rollback();
                    echo json_encode(['success' => false, 'message' => 'Customer not found']);
                }
                
            } catch (Exception $e) {
                $pdo->rollback();
                throw $e;
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>