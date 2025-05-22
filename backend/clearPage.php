<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Connect to MySQL
include 'db_config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sql = "DELETE FROM temporary_medical_data";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['status' => 'success', 'message' => 'All records deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error deleting records: ' . $conn->error]);
    }
    $conn->close();
}
?>