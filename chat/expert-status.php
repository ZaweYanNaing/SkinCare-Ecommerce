<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['expertID']) || !isset($input['status'])) {
            sendResponse(false, null, 'Missing required fields');
        }
        
        $expertID = $input['expertID'];
        $status = $input['status'];
        
        // Validate status
        $validStatuses = ['active', 'busy', 'offline'];
        if (!in_array($status, $validStatuses)) {
            sendResponse(false, null, 'Invalid status');
        }
        
        // Update expert status
        $stmt = $pdo->prepare("UPDATE Expert SET Status = ? WHERE ExpertID = ?");
        
        if ($stmt->execute([$status, $expertID]) && $stmt->rowCount() > 0) {
            sendResponse(true, [
                'expertID' => $expertID,
                'status' => $status
            ], 'Expert status updated successfully');
        } else {
            sendResponse(false, null, 'Expert not found or status unchanged');
        }
    } else {
        http_response_code(405);
        sendResponse(false, null, 'Method not allowed');
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>