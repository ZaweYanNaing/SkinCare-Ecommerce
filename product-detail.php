<?php
// CORS and content headers
header('Access-Control-Allow-Origin: *');
header("Content-Type: application/json");

// Include database connection
include 'db/database.php';

// Validate and sanitize input
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(["error" => "Invalid product ID"]);
    http_response_code(400);
    exit();
}

$productID = (int)$_GET['id'];

// Prepare SQL statement
$sql = "SELECT * FROM Product WHERE ProductID = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $productID);
$stmt->execute();
$result = $stmt->get_result();

// Fetch product
if ($result->num_rows > 0) {
    $product = $result->fetch_assoc();
    echo json_encode($product);
} else {
    echo json_encode(["error" => "Product not found"]);
    http_response_code(404);
}
?>
