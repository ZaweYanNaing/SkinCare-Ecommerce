<?php
// Test script for expert status management
echo "Testing Expert Status Management\n";
echo "===============================\n\n";

// Test 1: Check current expert statuses
echo "Test 1: Current Expert Statuses\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/experts.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n\n";

// Test 2: Update expert status to offline
echo "Test 2: Setting Dr. Sarah Johnson (ID: 1) to offline\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/expert-status.php');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'expertID' => 1,
    'status' => 'offline'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n\n";

// Test 3: Update expert status to active
echo "Test 3: Setting Dr. Sarah Johnson (ID: 1) to active\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/expert-status.php');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'expertID' => 1,
    'status' => 'active'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n\n";

// Test 4: Test the offline endpoint (simulating page close)
echo "Test 4: Testing offline endpoint (simulating page close)\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/expert-offline.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'expertID' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n\n";

// Test 5: Check final expert statuses
echo "Test 5: Final Expert Statuses\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/experts.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo "Response: $response\n\n";

echo "Test completed!\n\n";
echo "Expected Behavior:\n";
echo "- Expert login: Status changes to 'active'\n";
echo "- Expert logout: Status changes to 'offline'\n";
echo "- Page close: Status changes to 'offline'\n";
echo "- Only 'active' experts appear in customer's expert list\n";
?>