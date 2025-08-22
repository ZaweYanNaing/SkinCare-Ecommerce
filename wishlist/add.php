<?php
// ✅ CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ✅ Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db/database.php';

// ✅ Get raw input and decode JSON
$data = json_decode(file_get_contents("php://input"), true);

// ✅ Validate input
if (!isset($data['UserID']) || !isset($data['ProductID'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing UserID or ProductID"]);
    exit();
}

$userId = (int)$data['UserID'];
$productId = (int)$data['ProductID'];

// ✅ Prepare and execute SQL
$sql = "INSERT INTO WishList (CustomerID, ProductID) VALUES (?, ?)";
$stmt = $con->prepare($sql);

if ($stmt === false) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to prepare SQL"]);
    exit();
}

$stmt->bind_param("ii", $userId, $productId);
$result = $stmt->execute();

if ($result) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>
