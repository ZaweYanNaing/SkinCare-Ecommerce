<?php
// Setup script to create chat tables and insert sample data
include './db/database.php';

// Read and execute the SQL file
$sql = file_get_contents('./chat_tables.sql');

// Split the SQL into individual statements
$statements = array_filter(array_map('trim', explode(';', $sql)));

$success = true;
$errors = [];

foreach ($statements as $statement) {
    if (!empty($statement)) {
        try {
            if ($con->query($statement) === FALSE) {
                $errors[] = "Error executing statement: " . $con->error;
                $success = false;
            }
        } catch (Exception $e) {
            $errors[] = "Exception: " . $e->getMessage();
            $success = false;
        }
    }
}

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Chat system tables created successfully!'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Some errors occurred during setup',
        'errors' => $errors
    ]);
}

$con->close();
?>