<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $customerID = $_GET['customerID'] ?? null;
        $expertID = $_GET['expertID'] ?? null;
        
        if ($customerID) {
            // Get conversations for customer
            $stmt = $pdo->prepare("
                SELECT c.*, e.Name as ExpertName, e.Specialization, e.Avatar as ExpertAvatar,
                       (SELECT COUNT(*) FROM Message m WHERE m.ConversationID = c.ConversationID AND m.SenderType = 'expert' AND m.IsRead = 0) as UnreadCount
                FROM Conversation c 
                LEFT JOIN Expert e ON c.ExpertID = e.ExpertID 
                WHERE c.CustomerID = ? 
                ORDER BY c.UpdatedAt DESC
            ");
            $stmt->execute([$customerID]);
        } else if ($expertID) {
            // Get conversations for expert
            $stmt = $pdo->prepare("
                SELECT c.*, cu.CName as CustomerName,
                       (SELECT COUNT(*) FROM Message m WHERE m.ConversationID = c.ConversationID AND m.SenderType = 'customer' AND m.IsRead = 0) as UnreadCount
                FROM Conversation c 
                LEFT JOIN Customer cu ON c.CustomerID = cu.CID 
                WHERE c.ExpertID = ? OR (c.ExpertID IS NULL AND c.Status = 'waiting')
                ORDER BY c.UpdatedAt DESC
            ");
            $stmt->execute([$expertID]);
        } else {
            sendResponse(false, null, 'CustomerID or ExpertID required');
        }
        
        $conversations = $stmt->fetchAll();
        sendResponse(true, $conversations);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new conversation
        $input = json_decode(file_get_contents('php://input'), true);
        $customerID = $input['customerID'] ?? null;
        $expertID = $input['expertID'] ?? null;
        
        if (!$customerID) {
            sendResponse(false, null, 'CustomerID is required');
        }
        
        // Check if there's already an active conversation with this specific expert
        if ($expertID) {
            $checkStmt = $pdo->prepare("SELECT ConversationID FROM Conversation WHERE CustomerID = ? AND ExpertID = ? AND Status IN ('waiting', 'active')");
            $checkStmt->execute([$customerID, $expertID]);
            $existing = $checkStmt->fetch();
            
            if ($existing) {
                sendResponse(true, ['conversationID' => $existing['ConversationID']], 'Using existing conversation with this expert');
            }
        } else {
            // For quick consultation (no specific expert), check for any waiting conversation
            $checkStmt = $pdo->prepare("SELECT ConversationID FROM Conversation WHERE CustomerID = ? AND Status = 'waiting' AND ExpertID IS NULL");
            $checkStmt->execute([$customerID]);
            $existing = $checkStmt->fetch();
            
            if ($existing) {
                sendResponse(true, ['conversationID' => $existing['ConversationID']], 'Using existing waiting conversation');
            }
        }
        
        // Create new conversation
        $stmt = $pdo->prepare("INSERT INTO Conversation (CustomerID, ExpertID, Status) VALUES (?, ?, ?)");
        $status = $expertID ? 'active' : 'waiting';
        
        if ($stmt->execute([$customerID, $expertID, $status])) {
            $conversationID = $pdo->lastInsertId();
            sendResponse(true, ['conversationID' => $conversationID], 'Conversation created');
        } else {
            sendResponse(false, null, 'Failed to create conversation');
        }
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update conversation (assign expert, change status)
        $input = json_decode(file_get_contents('php://input'), true);
        $conversationID = $input['conversationID'] ?? null;
        $expertID = $input['expertID'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$conversationID) {
            sendResponse(false, null, 'ConversationID is required');
        }
        
        $updates = [];
        $params = [];
        $types = '';
        
        if ($expertID !== null) {
            $updates[] = "ExpertID = ?";
            $params[] = $expertID;
            $types .= 'i';
        }
        
        if ($status !== null) {
            $updates[] = "Status = ?";
            $params[] = $status;
            $types .= 's';
        }
        
        if (empty($updates)) {
            sendResponse(false, null, 'No updates provided');
        }
        
        $params[] = $conversationID;
        $types .= 'i';
        
        $sql = "UPDATE Conversation SET " . implode(', ', $updates) . " WHERE ConversationID = ?";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute($params)) {
            sendResponse(true, null, 'Conversation updated');
        } else {
            sendResponse(false, null, 'Failed to update conversation');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>