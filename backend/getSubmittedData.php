<?php
// header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
include 'db_config.php';

$loggedInUser = json_decode(file_get_contents('php://input'), true);
$agentName = $loggedInUser['agentName'];
$role = $loggedInUser['role'];

if ($role === 'admin') {
  // Fetch all submitted data for admin
  $result = $conn->query("SELECT * FROM temporary_medical_data");
} else {
  // Fetch submitted data for the specific agent
  $result = $conn->query("SELECT * FROM temporary_medical_data WHERE agent = '$agentName'");
}

$data = [];
while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}
echo json_encode($data);
?>