<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db/database.php';

// Function to upload image
function uploadImage($file) {
    $targetDir = "../Skincare-Frontend/src/assets/review/";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    $targetFile = $targetDir . basename($file["name"]);
    if (move_uploaded_file($file["tmp_name"], $targetFile)) {
        return basename($file["name"]);
    }
    return null;
}


// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db/database.php';


// Required fields
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $comment = isset($_POST['Comment']) ? trim($_POST['Comment']) : null;
    $rating = isset($_POST['Rating']) ? (int)$_POST['Rating'] : null;
    $cid = isset($_POST['CID']) ? (int)$_POST['CID'] : null;
    $productId = isset($_POST['productID']) ? (int)$_POST['productID'] : null;

    if (!$comment || !$rating || !$cid || !$productId) {
        echo json_encode(["success" => false, "message" => "Missing required fields."]);
        exit();
    }

    // Check customer status before allowing review submission
    $statusStmt = $con->prepare("SELECT Status FROM Customer WHERE CID = ?");
    $statusStmt->bind_param("i", $cid);
    $statusStmt->execute();
    $statusResult = $statusStmt->get_result();
    $customer = $statusResult->fetch_assoc();
    $statusStmt->close();

    if (!$customer) {
        echo json_encode(["success" => false, "message" => "Customer not found."]);
        exit();
    }

    if ($customer['Status'] === 'banned') {
        echo json_encode([
            "success" => false, 
            "message" => "Your account has been banned and cannot post reviews. Please contact customer support.",
            "error_code" => "ACCOUNT_BANNED"
        ]);
        exit();
    }

    $beforeImg = null;
    if (isset($_FILES['BeforeImg']) && $_FILES['BeforeImg']['error'] === 0) {
        $beforeImg = uploadImage($_FILES['BeforeImg']);
    }

    $afterImg = null;
    if (isset($_FILES['AfterImg']) && $_FILES['AfterImg']['error'] === 0) {
        $afterImg = uploadImage($_FILES['AfterImg']);
    }

    $sql = "INSERT INTO Review (BeforeImg, AfterImg, Comment, CID, Rating, productID)
            VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $con->prepare($sql);
    $stmt->bind_param("sssiii", $beforeImg, $afterImg, $comment, $cid, $rating, $productId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Review submitted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to submit review."]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}

$con->close();
?>
