<?php
/**
 * Customer Status Utility Functions
 * Provides functions to check and validate customer account status
 */

/**
 * Check if a customer is allowed to perform actions based on their status
 * @param mysqli $connection Database connection
 * @param int $customerID Customer ID to check
 * @param string $action Action being performed ('login', 'order', 'review', etc.)
 * @return array Result with success status and message
 */
function checkCustomerStatus($connection, $customerID, $action = 'general') {
    try {
        $stmt = $connection->prepare("SELECT CID, CName, CEmail, Status FROM Customer WHERE CID = ?");
        if (!$stmt) {
            return [
                'allowed' => false,
                'message' => 'Database error: ' . $connection->error,
                'error_code' => 'DB_ERROR'
            ];
        }

        $stmt->bind_param("i", $customerID);
        if (!$stmt->execute()) {
            $stmt->close();
            return [
                'allowed' => false,
                'message' => 'Database error: ' . $stmt->error,
                'error_code' => 'DB_ERROR'
            ];
        }

        $result = $stmt->get_result();
        $customer = $result->fetch_assoc();
        $stmt->close();

        if (!$customer) {
            return [
                'allowed' => false,
                'message' => 'Customer not found',
                'error_code' => 'CUSTOMER_NOT_FOUND'
            ];
        }

        $status = $customer['Status'];
        
        switch ($status) {
            case 'banned':
                $messages = [
                    'login' => 'Your account has been banned. Please contact customer support for assistance.',
                    'order' => 'Your account has been banned and cannot place orders. Please contact customer support.',
                    'review' => 'Your account has been banned and cannot post reviews. Please contact customer support.',
                    'general' => 'Your account has been banned. Please contact customer support.'
                ];
                
                return [
                    'allowed' => false,
                    'message' => $messages[$action] ?? $messages['general'],
                    'error_code' => 'ACCOUNT_BANNED',
                    'customer' => $customer
                ];
                
            case 'warned':
                $messages = [
                    'login' => 'Login successful. Please note: Your account has received warnings. Please review our terms of service.',
                    'order' => 'Order can be placed, but please note your account has warnings. Please review our terms of service.',
                    'review' => 'Review can be posted, but please note your account has warnings. Please review our terms of service.',
                    'general' => 'Action allowed, but your account has warnings. Please review our terms of service.'
                ];
                
                return [
                    'allowed' => true,
                    'message' => $messages[$action] ?? $messages['general'],
                    'warning' => true,
                    'customer' => $customer
                ];
                
            case 'active':
            default:
                return [
                    'allowed' => true,
                    'message' => 'Customer status is active',
                    'customer' => $customer
                ];
        }
        
    } catch (Exception $e) {
        return [
            'allowed' => false,
            'message' => 'Error checking customer status: ' . $e->getMessage(),
            'error_code' => 'SYSTEM_ERROR'
        ];
    }
}

/**
 * Get customer status badge information for frontend display
 * @param string $status Customer status
 * @return array Badge information with color and text
 */
function getStatusBadgeInfo($status) {
    switch ($status) {
        case 'active':
            return [
                'text' => 'Active',
                'color' => 'green',
                'class' => 'bg-green-100 text-green-800'
            ];
        case 'warned':
            return [
                'text' => 'Warned',
                'color' => 'yellow',
                'class' => 'bg-yellow-100 text-yellow-800'
            ];
        case 'banned':
            return [
                'text' => 'Banned',
                'color' => 'red',
                'class' => 'bg-red-100 text-red-800'
            ];
        default:
            return [
                'text' => 'Unknown',
                'color' => 'gray',
                'class' => 'bg-gray-100 text-gray-800'
            ];
    }
}

/**
 * Log customer status changes for audit purposes
 * @param mysqli $connection Database connection
 * @param int $customerID Customer ID
 * @param string $oldStatus Previous status
 * @param string $newStatus New status
 * @param int $adminID Admin who made the change
 * @param string $reason Reason for status change
 * @return bool Success status
 */
function logStatusChange($connection, $customerID, $oldStatus, $newStatus, $adminID = null, $reason = '') {
    try {
        // You can create a customer_status_log table later for audit trail
        // For now, this is a placeholder function
        
        // Example table structure:
        // CREATE TABLE customer_status_log (
        //     id INT AUTO_INCREMENT PRIMARY KEY,
        //     customer_id INT,
        //     old_status ENUM('active', 'warned', 'banned'),
        //     new_status ENUM('active', 'warned', 'banned'),
        //     admin_id INT,
        //     reason TEXT,
        //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        // );
        
        return true;
    } catch (Exception $e) {
        error_log("Failed to log status change: " . $e->getMessage());
        return false;
    }
}
?>