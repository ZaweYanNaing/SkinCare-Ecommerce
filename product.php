<?php
header('Access-Control-Allow-Origin: *');
header("Content-Type: application/json");

include './db/database.php';

// JOIN products with categories to include CategoryName
$sql = "
   SELECT 
    Product.ProductID,
    Product.Name,
    Product.Description,
    Product.Price,
    Product.Stock,
    Product.ForSkinType,
    Categories.CategoryName,
    Product.Image
  FROM Product
  LEFT JOIN Categories ON Product.CategoryID = Categories.CategoryID
";

$result = $con->query($sql);
$rows = [];

while ($row = $result->fetch_assoc()) {
    $row['Price'] = (float)$row['Price'];
    $row['Stock'] = (int)$row['Stock'];
    $rows[] = $row;
}

echo json_encode($rows);
?>
