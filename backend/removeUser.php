<?php
header('Content-Type: application/json');
include 'db_config.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method is allowed"]);
    exit;
}

// Get and validate JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

// Validate required field
if (empty($input['agentName'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "agentName field is required"]);
    exit;
}

try {
    // First check if user exists
    $checkStmt = $conn->prepare("SELECT role FROM users WHERE agentName = ?");
    $checkStmt->bind_param("s", $input['agentName']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $user = $result->fetch_assoc();
    if ($user['role'] === 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Admin users cannot be deleted"]);
        exit;
    }

    // Delete user
    $stmt = $conn->prepare("DELETE FROM users WHERE agentName = ?");
    $stmt->bind_param("s", $input['agentName']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User removed successfully"]);
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