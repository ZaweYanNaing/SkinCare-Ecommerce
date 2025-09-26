<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all active experts
        $stmt = $pdo->prepare("SELECT ExpertID, Name, Specialization, Bio, Avatar, Status FROM Expert WHERE Status IN ('active', 'busy') ORDER BY Status ASC, Name ASC");
        $stmt->execute();
        $experts = $stmt->fetchAll();
        
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
        
        // Get expert with password for verification
        $stmt = $pdo->prepare("SELECT ExpertID, Name, Email, Specialization, Bio, Password FROM Expert WHERE Email = ?");
        $stmt->execute([$email]);
        $expert = $stmt->fetch();
        
        if ($expert) {
            // Verify password - check both bcrypt and plain text for demo
            $passwordValid = false;
            
            // Check if it's a bcrypt hash
            if (password_verify($password, $expert['Password'])) {
                $passwordValid = true;
            }
            // For demo purposes, also check plain text (remove in production)
            elseif ($expert['Password'] === $password) {
                $passwordValid = true;
            }
            // Check MD5 hash (for compatibility)
            elseif ($expert['Password'] === md5($password)) {
                $passwordValid = true;
            }
            
            if ($passwordValid) {
                // Remove password from response
                unset($expert['Password']);
                
                // Update expert status to active
                $updateStmt = $pdo->prepare("UPDATE Expert SET Status = 'active' WHERE ExpertID = ?");
                $updateStmt->execute([$expert['ExpertID']]);
                
                sendResponse(true, $expert, 'Login successful');
            } else {
                sendResponse(false, null, 'Invalid credentials');
            }
        } else {
            sendResponse(false, null, 'Invalid credentials');
        }
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Server error: ' . $e->getMessage());
}
?>