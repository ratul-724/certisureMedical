<?php
header('Content-Type: application/json');
include 'db_config.php';

// Fetch users from the database
$result = $conn->query("SELECT id, agentName, password, role FROM users");

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

// Return users as JSON
echo json_encode($users);

$conn->close();
?>