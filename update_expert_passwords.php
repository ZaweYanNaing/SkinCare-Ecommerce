<?php
// Script to update expert passwords for testing
include './db/database.php';

// Update expert passwords to simple ones for demo
$experts = [
    ['email' => 'sarah@skincare.com', 'password' => 'hello'],
    ['email' => 'emily@skincare.com', 'password' => 'hello'],
    ['email' => 'michael@skincare.com', 'password' => 'hello']
];

$success = true;
$updated = 0;

foreach ($experts as $expert) {
    // Use MD5 for simplicity in demo (use bcrypt in production)
    $hashedPassword = md5($expert['password']);
    
    $stmt = $con->prepare("UPDATE Expert SET Password = ? WHERE Email = ?");
    $stmt->bind_param("ss", $hashedPassword, $expert['email']);
    
    if ($stmt->execute()) {
        $updated++;
        echo "Updated password for " . $expert['email'] . "\n";
    } else {
        echo "Failed to update password for " . $expert['email'] . "\n";
        $success = false;
    }
}

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => "Successfully updated $updated expert passwords",
        'credentials' => [
            'email' => 'sarah@skincare.com (or emily@skincare.com, michael@skincare.com)',
            'password' => 'hello'
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Some passwords failed to update'
    ]);
}

$con->close();
?>