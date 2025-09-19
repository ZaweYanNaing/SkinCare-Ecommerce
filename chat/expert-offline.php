<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data (for sendBeacon)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $expertID = $data['expertID'] ?? null;
    
    if ($expertID) {
        try {
            $stmt = $con->prepare("UPDATE Expert SET Status = 'offline' WHERE ExpertID = ?");
            $stmt->bind_param("i", $expertID);
            $stmt->execute();
            
            echo json_encode(['success' => true, 'message' => 'Expert set to offline']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ExpertID required']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}

$con->close();
?>