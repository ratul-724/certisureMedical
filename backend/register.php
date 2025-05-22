<?php
header('Content-Type: application/json');
include 'db_config.php';

// Try to get JSON data
$input = json_decode(file_get_contents("php://input"), true);

// If JSON is empty, try getting from $_POST (for FormData requests)
if (!$input) {
    $input = $_POST;
}

// Debugging: Check if data is received
if (!$input || !isset($input['agentName']) || !isset($input['password'])) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data or missing fields."]);
    exit;
}

// Extract data safely
$agentName = trim($input['agentName']);
$password = trim($input['password']);
$role = isset($input['role']) ? $input['role'] : 'user';  // Default role if not provided

// Check if the user already exists
$stmt = $conn->prepare("SELECT * FROM users WHERE agentName = ?");
$stmt->bind_param("s", $agentName);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // If the user already exists, return an error message
    echo json_encode(["success" => false, "message" => "User with this agent name already exists."]);
    exit;
}

// Hash password
// $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Prepare and execute the insert query
$stmt = $conn->prepare("INSERT INTO users (agentName, password, role) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $agentName, $password, $role);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
