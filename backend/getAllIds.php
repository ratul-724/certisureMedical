<?php
// header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
include 'db_config.php';

// Fetch IDs from temporary_medical_data
$tempResult = $conn->query("SELECT id FROM temporary_medical_data");
$tempIds = [];
while ($row = $tempResult->fetch_assoc()) {
    $tempIds[] = $row['id'];
}

// Fetch IDs from medical_data
$medResult = $conn->query("SELECT id FROM medical_data");
$medIds = [];
while ($row = $medResult->fetch_assoc()) {
    $medIds[] = $row['id'];
}

echo json_encode(['tempIds' => $tempIds, 'medIds' => $medIds]);
?>