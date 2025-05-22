<?php
// header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json'); // Ensure the response is JSON
include 'db_config.php'; // Include your database configuration

$data = json_decode(file_get_contents("php://input"), true); // Get JSON input

if (!$data || !isset($data['id']) || empty($data['id'])) {
    echo json_encode(["status" => "error", "message" => "❌ Missing or invalid ID"]);
    exit();
}

try {
    // Extract data
    $id = $data['id'];
    $medical_name = $data['medical_name'];
    $date = $data['date'];
    $name = $data['name'];
    $passport = $data['passport'];
    $agent = $data['agent'];
    $laboratory = $data['laboratory'];
    $remarks = $data['remarks'];

    // Prepare SQL statement
    $sql = "UPDATE medical_data SET 
            medical_name = ?, 
            date = ?, 
            name = ?, 
            passport = ?, 
            agent = ?, 
            laboratory = ?, 
            remarks = ?
            WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("SQL Prepare Failed: " . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param(
        "ssssssss", // 11 placeholders: 10 strings + 1 string for the ID
        $medical_name, 
        $date, 
        $name, 
        $passport, 
        $agent, 
        $laboratory, 
        $remarks, 
        $id // ID for the WHERE clause
    );

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "✅ Data updated successfully"]);
    } else {
        throw new Exception("❌ Update failed: " . $stmt->error);
    }

    // Close the statement
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

// Close the connection
$conn->close();
?>