<?php
header('Access-Control-Allow-Origin: *');
header("Content-Type: application/json");

include './db/database.php';

$sql = "SELECT * FROM Categories";
$result = $con->query($sql);
$rows = [];

while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

echo json_encode($rows);
?>