<?php
// header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
include 'db_config.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input['medical_name'], $input['date'], $input['id'], $input['name'], $input['passport'], $input['agent'], $input['laboratory'], $input['remarks'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit;
}

$medical_name = $input['medical_name'];
$date = $input['date'];
$id = $input['id'];
$name = $input['name'];
$passport = $input['passport'];
$agent = $input['agent'];
$laboratory = $input['laboratory'];
$remarks = $input['remarks'];

// Prepare SQL query
$stmt = $conn->prepare("INSERT INTO temporary_medical_data (medical_name, date, id, name, passport, agent, laboratory, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", $medical_name, $date, $id, $name, $passport, $agent, $laboratory, $remarks);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Data submitted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>