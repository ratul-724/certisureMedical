<?php
header('Content-Type: application/json');
include 'db_config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method is allowed"]);
    exit;
}

// Get and validate JSON input
$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

// Validate required fields
$requiredFields = ['currentAgentName', 'agentName', 'password', 'role'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit;
    }
}

try {
    // Check if user exists
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE agentName = ?");
    $checkStmt->bind_param("s", $input['currentAgentName']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    // Update user
    $stmt = $conn->prepare("UPDATE users SET agentName = ?, password = ?, role = ? WHERE agentName = ?");
    $stmt->bind_param("ssss", $input['agentName'], $input['password'], $input['role'], $input['currentAgentName']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User updated successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

$conn->close();
?>