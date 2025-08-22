<?php
header('Access-Control-Allow-Origin: *'); // Allow all origins — for development only
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../db/database.php';

$userId = (int)$_GET['user_id'];

$sql = "
 SELECT p.*, w.wishlistID
FROM Product p
JOIN WishList w ON p.ProductID = w.ProductID
WHERE w.CustomerID = ?
";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['Price'] = (float)$row['Price'];
    $row['Stock'] = (int)$row['Stock'];
    $rows[] = $row;
}
echo json_encode($rows);
?>
