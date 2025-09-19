<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update expert status
        $input = json_decode(file_get_contents('php://input'), true);
        $expertID = $input['expertID'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$expertID || !$status) {
            sendResponse(false, null, 'ExpertID and status are required');
        }
        
        // Validate status
        $validStatuses = ['active', 'offline', 'busy'];
        if (!in_array($status, $validStatuses)) {
            sendResponse(false, null, 'Invalid status. Must be: active, offline, or busy');
        }
        
        $stmt = $con->prepare("UPDATE Expert SET Status = ? WHERE ExpertID = ?");
        $stmt->bind_param("si", $status, $expertID);
        
        if ($stmt->execute()) {
            sendResponse(true, ['expertID' => $expertID, 'status' => $status], 'Expert status updated successfully');
        } else {
            sendResponse(false, null, 'Failed to update expert status');
        }
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get expert status
        $expertID = $_GET['expertID'] ?? null;
        
        if (!$expertID) {
            sendResponse(false, null, 'ExpertID is required');
        }
        
        $stmt = $con->prepare("SELECT ExpertID, Name, Status FROM Expert WHERE ExpertID = ?");
        $stmt->bind_param("i", $expertID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $expert = $result->fetch_assoc();
            sendResponse(true, $expert);
        } else {
            sendResponse(false, null, 'Expert not found');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>