<?php
// Script to clean up any duplicate messages in the database
include './db/database.php';

echo "Checking for duplicate messages...\n";

// Find potential duplicates (same conversation, sender, text, and similar timestamps)
$sql = "
SELECT 
    ConversationID, 
    SenderType, 
    SenderID, 
    MessageText, 
    COUNT(*) as count,
    GROUP_CONCAT(MessageID ORDER BY MessageID) as message_ids
FROM Message 
GROUP BY ConversationID, SenderType, SenderID, MessageText, DATE(SentAt), HOUR(SentAt), MINUTE(SentAt)
HAVING COUNT(*) > 1
";

$result = $con->query($sql);

if ($result->num_rows > 0) {
    echo "Found potential duplicates:\n";
    
    $deletedCount = 0;
    while ($row = $result->fetch_assoc()) {
        $messageIds = explode(',', $row['message_ids']);
        $keepId = array_shift($messageIds); // Keep the first message
        
        echo "Conversation {$row['ConversationID']}: Keeping message {$keepId}, removing " . implode(', ', $messageIds) . "\n";
        
        // Delete the duplicate messages (keep the first one)
        foreach ($messageIds as $deleteId) {
            $deleteStmt = $con->prepare("DELETE FROM Message WHERE MessageID = ?");
            $deleteStmt->bind_param("i", $deleteId);
            if ($deleteStmt->execute()) {
                $deletedCount++;
            }
        }
    }
    
    echo "\nDeleted $deletedCount duplicate messages.\n";
} else {
    echo "No duplicate messages found.\n";
}

// Show current message count
$countResult = $con->query("SELECT COUNT(*) as total FROM Message");
$count = $countResult->fetch_assoc()['total'];
echo "\nTotal messages in database: $count\n";

$con->close();
?>