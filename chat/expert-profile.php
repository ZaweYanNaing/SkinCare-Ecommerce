<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get expert profile data
        if (!isset($_GET['expertID'])) {
            sendResponse(false, null, 'Expert ID is required');
        }
        
        $expertID = $_GET['expertID'];
        
        $stmt = $pdo->prepare("SELECT ExpertID, Name, Email, Specialization, Bio, Status FROM Expert WHERE ExpertID = ?");
        $stmt->execute([$expertID]);
        $expertData = $stmt->fetch();
        
        if ($expertData) {
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
        $stmt = $pdo->prepare("SELECT ExpertID FROM Expert WHERE Email = ? AND ExpertID != ?");
        $stmt->execute([$email, $expertID]);
        
        if ($stmt->fetch()) {
            sendResponse(false, null, 'Email is already in use by another expert');
        }
        
        // Update expert profile
        $stmt = $pdo->prepare("
            UPDATE Expert 
            SET Name = ?, Email = ?, Specialization = ?, Bio = ?, Status = ?
            WHERE ExpertID = ?
        ");
        
        if ($stmt->execute([$name, $email, $specialization, $bio, $status, $expertID]) && $stmt->rowCount() > 0) {
            // Fetch updated expert data
            $stmt = $pdo->prepare("SELECT ExpertID, Name, Email, Specialization, Bio, Status FROM Expert WHERE ExpertID = ?");
            $stmt->execute([$expertID]);
            $expertData = $stmt->fetch();
            
            sendResponse(true, $expertData, 'Profile updated successfully');
        } else {
            sendResponse(false, null, 'Expert not found or no changes made');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>