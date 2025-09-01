<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all notifications or specific notification
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM Notification WHERE NotiID = ?");
                $stmt->execute([$_GET['id']]);
                $notification = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($notification) {
                    echo json_encode(['success' => true, 'data' => $notification]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Notification not found']);
                }
            } else {
                // Get all notifications with customer info
                $query = "
                    SELECT 
                        n.NotiID,
                        n.CustomerID,
                        n.Message,
                        n.DateSent,
                        n.isRead,
                        n.Type,
                        n.Title,
                        c.CName as CustomerName,
                        c.CEmail as CustomerEmail
                    FROM Notification n
                    LEFT JOIN Customer c ON n.CustomerID = c.CID
                    ORDER BY n.DateSent DESC, n.NotiID DESC
                ";
                
                $stmt = $pdo->prepare($query);
                $stmt->execute();
                $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $notifications]);
            }
            break;
            
        case 'POST':
            // Create new notification
            $input = json_decode(file_get_contents('php://input'), true);
            
            $customerID = $input['customerID'] ?? null;
            $title = $input['title'] ?? '';
            $message = $input['message'] ?? '';
            $type = $input['type'] ?? 'general';
            
            $stmt = $pdo->prepare("
                INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) 
                VALUES (?, ?, ?, ?, NOW(), 0)
            ");
            
            if ($stmt->execute([$customerID, $title, $message, $type])) {
                $notificationId = $pdo->lastInsertId();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Notification created successfully',
                    'notificationId' => $notificationId
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create notification']);
            }
            break;
            
        case 'PUT':
            // Update notification (mark as read/unread)
            $input = json_decode(file_get_contents('php://input'), true);
            $notificationId = $input['id'] ?? null;
            $isRead = $input['isRead'] ?? 1;
            
            if ($notificationId) {
                $stmt = $pdo->prepare("UPDATE Notification SET isRead = ? WHERE NotiID = ?");
                if ($stmt->execute([$isRead, $notificationId])) {
                    echo json_encode(['success' => true, 'message' => 'Notification updated successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to update notification']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Notification ID required']);
            }
            break;
            
        case 'DELETE':
            // Delete notification
            $input = json_decode(file_get_contents('php://input'), true);
            $notificationId = $input['id'] ?? null;
            
            if ($notificationId) {
                $stmt = $pdo->prepare("DELETE FROM Notification WHERE NotiID = ?");
                if ($stmt->execute([$notificationId])) {
                    echo json_encode(['success' => true, 'message' => 'Notification deleted successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete notification']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Notification ID required']);
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