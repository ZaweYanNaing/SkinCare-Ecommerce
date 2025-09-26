<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get expert profile data
        if (!isset($_GET['expertID'])) {
            sendResponse(false, null, 'Expert ID is required');
        }
        
        $expertID = $_GET['expertID'];
        
        $stmt = $con->prepare("SELECT ExpertID, Name, Email, Specialization, Bio, Status FROM Expert WHERE ExpertID = ?");
        $stmt->bind_param("i", $expertID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $expertData = $result->fetch_assoc();
            sendResponse(true, $expertData);
        } else {
            sendResponse(false, null, 'Expert not found');
        }
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update expert profile
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['expertID'])) {
            sendResponse(false, null, 'Expert ID is required');
        }
        
        $expertID = $input['expertID'];
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $specialization = $input['specialization'] ?? '';
        $bio = $input['bio'] ?? '';
        $status = $input['status'] ?? 'active';
        
        // Validate status
        $validStatuses = ['active', 'busy', 'offline'];
        if (!in_array($status, $validStatuses)) {
            sendResponse(false, null, 'Invalid status');
        }
        
        // Validate required fields
        if (empty($name) || empty($email) || empty($specialization)) {
            sendResponse(false, null, 'Name, email, and specialization are required');
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, null, 'Invalid email format');
        }
        
        // Check if email is already used by another expert
        $stmt = $con->prepare("SELECT ExpertID FROM Expert WHERE Email = ? AND ExpertID != ?");
        $stmt->bind_param("si", $email, $expertID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            sendResponse(false, null, 'Email is already in use by another expert');
        }
        
        // Update expert profile
        $stmt = $con->prepare("
            UPDATE Expert 
            SET Name = ?, Email = ?, Specialization = ?, Bio = ?, Status = ?
            WHERE ExpertID = ?
        ");
        $stmt->bind_param("sssssi", $name, $email, $specialization, $bio, $status, $expertID);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            // Fetch updated expert data
            $stmt = $con->prepare("SELECT ExpertID, Name, Email, Specialization, Bio, Status FROM Expert WHERE ExpertID = ?");
            $stmt->bind_param("i", $expertID);
            $stmt->execute();
            $result = $stmt->get_result();
            $expertData = $result->fetch_assoc();
            
            sendResponse(true, $expertData, 'Profile updated successfully');
        } else {
            sendResponse(false, null, 'Expert not found or no changes made');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>