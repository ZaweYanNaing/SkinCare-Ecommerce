<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $conversationID = $_GET['conversationID'] ?? null;
        $lastMessageID = $_GET['lastMessageID'] ?? 0;
        
        if (!$conversationID) {
            sendResponse(false, null, 'ConversationID is required');
        }
        
        // Get messages for conversation
        $stmt = $pdo->prepare("
            SELECT m.*, 
                   CASE 
                       WHEN m.SenderType = 'customer' THEN c.CName
                       WHEN m.SenderType = 'expert' THEN e.Name
                   END as SenderName,
                   CASE 
                       WHEN m.SenderType = 'expert' THEN e.Avatar
                       ELSE NULL
                   END as SenderAvatar
            FROM Message m
            LEFT JOIN Conversation conv ON m.ConversationID = conv.ConversationID
            LEFT JOIN Customer c ON conv.CustomerID = c.CID
            LEFT JOIN Expert e ON conv.ExpertID = e.ExpertID
            WHERE m.ConversationID = ? AND m.MessageID > ?
            ORDER BY m.SentAt ASC
        ");
        $stmt->execute([$conversationID, $lastMessageID]);
        $messages = $stmt->fetchAll();
        
        sendResponse(true, $messages);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Send new message
        $input = json_decode(file_get_contents('php://input'), true);
        $conversationID = $input['conversationID'] ?? null;
        $senderType = $input['senderType'] ?? null;
        $senderID = $input['senderID'] ?? null;
        $messageText = $input['messageText'] ?? null;
        $messageType = $input['messageType'] ?? 'text';
        
        if (!$conversationID || !$senderType || !$senderID || !$messageText) {
            sendResponse(false, null, 'Missing required fields');
        }
        
        // Insert message
        $stmt = $pdo->prepare("INSERT INTO Message (ConversationID, SenderType, SenderID, MessageText, MessageType) VALUES (?, ?, ?, ?, ?)");
        
        if ($stmt->execute([$conversationID, $senderType, $senderID, $messageText, $messageType])) {
            $messageID = $pdo->lastInsertId();
            
            // Update conversation timestamp
            $updateStmt = $pdo->prepare("UPDATE Conversation SET UpdatedAt = CURRENT_TIMESTAMP WHERE ConversationID = ?");
            $updateStmt->execute([$conversationID]);
            
            // Get the sent message with sender info
            $getStmt = $pdo->prepare("
                SELECT m.*, 
                       CASE 
                           WHEN m.SenderType = 'customer' THEN c.CName
                           WHEN m.SenderType = 'expert' THEN e.Name
                       END as SenderName,
                       CASE 
                           WHEN m.SenderType = 'expert' THEN e.Avatar
                           ELSE NULL
                       END as SenderAvatar
                FROM Message m
                LEFT JOIN Conversation conv ON m.ConversationID = conv.ConversationID
                LEFT JOIN Customer c ON conv.CustomerID = c.CID
                LEFT JOIN Expert e ON conv.ExpertID = e.ExpertID
                WHERE m.MessageID = ?
            ");
            $getStmt->execute([$messageID]);
            $message = $getStmt->fetch();
            
            sendResponse(true, $message, 'Message sent');
        } else {
            sendResponse(false, null, 'Failed to send message');
        }
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Mark messages as read
        $input = json_decode(file_get_contents('php://input'), true);
        $conversationID = $input['conversationID'] ?? null;
        $senderType = $input['senderType'] ?? null;
        
        if (!$conversationID || !$senderType) {
            sendResponse(false, null, 'ConversationID and senderType are required');
        }
        
        // Mark messages as read (opposite sender type)
        $oppositeSenderType = $senderType === 'customer' ? 'expert' : 'customer';
        $stmt = $pdo->prepare("UPDATE Message SET IsRead = 1 WHERE ConversationID = ? AND SenderType = ?");
        
        if ($stmt->execute([$conversationID, $oppositeSenderType])) {
            sendResponse(true, null, 'Messages marked as read');
        } else {
            sendResponse(false, null, 'Failed to mark messages as read');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>