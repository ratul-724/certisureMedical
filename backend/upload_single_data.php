<?php
// header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
include 'db_config.php'; // Include your database configuration

$response = ['status' => 'error', 'message' => 'Failed to upload data'];

try {
    // Get the row ID from the request
    $data = json_decode(file_get_contents('php://input'), true);
    $rowId = $data['rowId'] ?? null;

    if (!$rowId) {
        throw new Exception("Row ID is missing.");
    }

    // Fetch the specific row from temporary_medical_data
    $stmtFetch = $conn->prepare("
        SELECT * FROM temporary_medical_data WHERE id = ?
    ");
    $stmtFetch->bind_param("s", $rowId);
    $stmtFetch->execute();
    $result = $stmtFetch->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("No record found with the provided ID.");
    }

    $row = $result->fetch_assoc();

    // Insert the row into medical_data
    $stmtInsert = $conn->prepare("
        INSERT INTO medical_data 
        (medical_name, date, id, name, passport, agent, laboratory, remarks) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmtInsert->bind_param("ssssssss", 
        $row['medical_name'], 
        $row['date'], 
        $row['id'], 
        $row['name'], 
        $row['passport'], 
        $row['agent'], 
        $row['laboratory'], 
        $row['remarks'], 
    );

    if ($stmtInsert->execute()) {
        $response = ['status' => 'success', 'message' => 'Record uploaded successfully'];
    } else {
        throw new Exception("Error inserting record: " . $stmtInsert->error);
    }

    $stmtInsert->close();
    $stmtFetch->close();
} catch (Exception $e) {
    $response['message'] = 'Error uploading data: ' . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>