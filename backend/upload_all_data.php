<?php
// Ensure no output before headers
ob_start();

// Set proper headers FIRST
header('Content-Type: application/json');

// Enable error reporting (remove in production)
error_reporting(0); // Turn off in production
ini_set('display_errors', 0); // Turn off in production

require_once 'db_config.php';
$response = ['status' => 'error', 'message' => '', 'uploaded' => 0];

try {
    // Check if there's data to process
    $checkQuery = "SELECT COUNT(*) AS count FROM temporary_medical_data";
    $checkResult = $conn->query($checkQuery);
    $row = $checkResult->fetch_assoc();
    
    if ($row['count'] == 0) {
        throw new Exception("No data available to upload");
    }

    $conn->begin_transaction();

    // Get unique records not in medical_data
    $selectQuery = "SELECT t.* FROM temporary_medical_data t
                   LEFT JOIN medical_data m ON t.id = m.id
                   WHERE m.id IS NULL";
    
    $sourceData = $conn->query($selectQuery);
    if (!$sourceData) {
        throw new Exception("Failed to fetch data: " . $conn->error);
    }

    $insertQuery = "INSERT INTO medical_data 
                   (medical_name, date, id, name, passport, agent, laboratory, remarks)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($insertQuery);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $uploadedCount = 0;
    while ($row = $sourceData->fetch_assoc()) {
        $stmt->bind_param(
            "ssssssss",
            $row['medical_name'],
            $row['date'],
            $row['id'],
            $row['name'],
            $row['passport'],
            $row['agent'],
            $row['laboratory'],
            $row['remarks']
        );

        if (!$stmt->execute()) {
            throw new Exception("Insert failed: " . $stmt->error);
        }
        $uploadedCount++;
    }

    // Removed the DELETE query that was clearing temporary data
    $conn->commit();
    
    $response = [
        'status' => 'success',
        'message' => "$uploadedCount records uploaded successfully",
        'uploaded' => $uploadedCount,
        'temporary_records_remaining' => $row['count'] // Show original count
    ];

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
    echo json_encode($response);
}
?>