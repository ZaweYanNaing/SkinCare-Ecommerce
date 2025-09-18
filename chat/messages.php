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
        $stmt = $con->prepare("
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
        $stmt->bind_param("ii", $conversationID, $lastMessageID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        
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
        $stmt = $con->prepare("INSERT INTO Message (ConversationID, SenderType, SenderID, MessageText, MessageType) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("isiss", $conversationID, $senderType, $senderID, $messageText, $messageType);
        
        if ($stmt->execute()) {
            $messageID = $con->insert_id;
            
            // Update conversation timestamp
            $updateStmt = $con->prepare("UPDATE Conversation SET UpdatedAt = CURRENT_TIMESTAMP WHERE ConversationID = ?");
            $updateStmt->bind_param("i", $conversationID);
            $updateStmt->execute();
            
            // Get the sent message with sender info
            $getStmt = $con->prepare("
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
            $getStmt->bind_param("i", $messageID);
            $getStmt->execute();
            $messageResult = $getStmt->get_result();
            $message = $messageResult->fetch_assoc();
            
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
        $stmt = $con->prepare("UPDATE Message SET IsRead = 1 WHERE ConversationID = ? AND SenderType = ?");
        $stmt->bind_param("is", $conversationID, $oppositeSenderType);
        
        if ($stmt->execute()) {
            sendResponse(true, null, 'Messages marked as read');
        } else {
            sendResponse(false, null, 'Failed to mark messages as read');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>