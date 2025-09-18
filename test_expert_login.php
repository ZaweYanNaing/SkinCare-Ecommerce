<?php
// Test script for expert login
echo "Testing Expert Login System\n";
echo "===========================\n\n";

// Test 1: Valid credentials
echo "Test 1: Valid credentials (sarah@skincare.com / hello)\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/experts.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'sarah@skincare.com',
    'password' => 'hello'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 2: Invalid credentials
echo "Test 2: Invalid credentials (wrong password)\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/experts.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'sarah@skincare.com',
    'password' => 'wrongpassword'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 3: Get experts list
echo "Test 3: Get experts list\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/experts.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

echo "All tests completed!\n";
echo "\nTo test in browser:\n";
echo "1. Go to http://localhost:5173/expert\n";
echo "2. Use credentials: sarah@skincare.com / hello\n";
echo "3. Or try: emily@skincare.com / hello\n";
echo "4. Or try: michael@skincare.com / hello\n";
?>