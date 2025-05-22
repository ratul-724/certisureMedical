<?php
// Connect to MySQL
include 'db_config.php';

// Query to fetch data from the medical_data table
$query = "SELECT * FROM medical_data"; // Ensure this matches your table name
$result = $conn->query($query);

if ($result === false) {
    die(json_encode(["error" => "Query failed: " . $conn->error]));
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

$conn->close();

// Return data as JSON
echo json_encode($data);
?>
