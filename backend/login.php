<?php
header('Content-Type: application/json');
include 'db_config.php';

// Get JSON input data
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!$input || !isset($input['agentName']) || !isset($input['password'])) {
    echo json_encode(["success" => false, "message" => "Invalid credentials."]);
    exit;
}

$agentName = trim($input['agentName']);
$password = trim($input['password']);

// Query the database for the user
$stmt = $conn->prepare("SELECT id, agentName, password, role FROM users WHERE agentName = ?");
$stmt->bind_param("s", $agentName);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($id, $dbAgentName, $dbPassword, $role);

// Check if user exists and password matches
if ($stmt->num_rows > 0) {
    $stmt->fetch();
    if (password_verify($password, $dbPassword)) {
        echo json_encode(["success" => true, "user" => ["id" => $id, "agentName" => $dbAgentName, "role" => $role]]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>
