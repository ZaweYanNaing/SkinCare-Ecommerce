<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all active experts
        $stmt = $con->prepare("SELECT ExpertID, Name, Specialization, Bio, Avatar, Status FROM Expert WHERE Status IN ('active', 'busy') ORDER BY Status ASC, Name ASC");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $experts = [];
        while ($row = $result->fetch_assoc()) {
            $experts[] = $row;
        }
        
        sendResponse(true, $experts);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Expert login
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        if (!$email || !$password) {
            sendResponse(false, null, 'Email and password are required');
        }
        
        $stmt = $con->prepare("SELECT ExpertID, Name, Email, Specialization FROM Expert WHERE Email = ? AND Password = ?");
        $hashedPassword = md5($password); // In production, use proper password hashing
        $stmt->bind_param("ss", $email, $hashedPassword);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $expert = $result->fetch_assoc();
            
            // Update expert status to active
            $updateStmt = $con->prepare("UPDATE Expert SET Status = 'active' WHERE ExpertID = ?");
            $updateStmt->bind_param("i", $expert['ExpertID']);
            $updateStmt->execute();
            
            sendResponse(true, $expert, 'Login successful');
        } else {
            sendResponse(false, null, 'Invalid credentials');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>