<?php
// Test script for multiple expert conversations
echo "Testing Multiple Expert Conversations\n";
echo "====================================\n\n";

// Simulate customer ID (you can change this to match a real customer)
$customerID = 5; // Assuming customer with ID 5 exists

echo "Testing conversations for Customer ID: $customerID\n\n";

// Test 1: Create conversation with Dr. Sarah Johnson (Expert ID 1)
echo "Test 1: Creating conversation with Dr. Sarah Johnson (Expert ID 1)\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/conversations.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'customerID' => $customerID,
    'expertID' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response1 = curl_exec($ch);
curl_close($ch);
echo "Response: $response1\n\n";

// Test 2: Create conversation with Dr. Emily Chen (Expert ID 2)
echo "Test 2: Creating conversation with Dr. Emily Chen (Expert ID 2)\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/conversations.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'customerID' => $customerID,
    'expertID' => 2
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response2 = curl_exec($ch);
curl_close($ch);
echo "Response: $response2\n\n";

// Test 3: Get all conversations for this customer
echo "Test 3: Getting all conversations for customer\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost/chat/conversations.php?customerID=$customerID");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response3 = curl_exec($ch);
curl_close($ch);
echo "Response: $response3\n\n";

// Test 4: Try to create another conversation with Dr. Sarah Johnson (should reuse existing)
echo "Test 4: Trying to create another conversation with Dr. Sarah Johnson (should reuse)\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/chat/conversations.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'customerID' => $customerID,
    'expertID' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response4 = curl_exec($ch);
curl_close($ch);
echo "Response: $response4\n\n";

echo "Test completed!\n\n";
echo "Expected Results:\n";
echo "- Test 1: Should create new conversation with Expert 1\n";
echo "- Test 2: Should create new conversation with Expert 2\n";
echo "- Test 3: Should show both conversations\n";
echo "- Test 4: Should reuse existing conversation with Expert 1\n\n";

echo "To test in browser:\n";
echo "1. Go to http://localhost:5173/consult\n";
echo "2. Sign in as customer\n";
echo "3. Try starting conversations with different experts\n";
echo "4. Each expert should have a separate conversation\n";
?>