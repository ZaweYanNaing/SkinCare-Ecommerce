<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Get notification statistics
    $stats = [];
    
    // Total notifications
    $totalStmt = $pdo->query("SELECT COUNT(*) as total FROM Notification");
    $stats['total'] = $totalStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Unread notifications
    $unreadStmt = $pdo->query("SELECT COUNT(*) as unread FROM Notification WHERE isRead = 0");
    $stats['unread'] = $unreadStmt->fetch(PDO::FETCH_ASSOC)['unread'];
    
    // Notifications by type
    $typeStmt = $pdo->query("
        SELECT 
            COALESCE(Type, 'general') as type, 
            COUNT(*) as count 
        FROM Notification 
        GROUP BY Type
    ");
    $stats['by_type'] = $typeStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Recent notifications (last 7 days)
    $recentStmt = $pdo->query("
        SELECT COUNT(*) as recent 
        FROM Notification 
        WHERE DateSent >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ");
    $stats['recent'] = $recentStmt->fetch(PDO::FETCH_ASSOC)['recent'];
    
    // Notifications per day (last 7 days)
    $dailyStmt = $pdo->query("
        SELECT 
            DATE(DateSent) as date,
            COUNT(*) as count
        FROM Notification 
        WHERE DateSent >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(DateSent)
        ORDER BY date DESC
    ");
    $stats['daily'] = $dailyStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $stats]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>