<?php
require_once 'db_config.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        throw new Exception("Invalid input data");
    }

    $query = "SELECT 1 FROM medical_data WHERE 
              medical_name = ? AND 
              date = ? AND 
              id = ? AND 
              name = ? AND 
              passport = ? AND 
              agent = ? AND 
              laboratory = ? AND 
              remarks = ?";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param(
        "ssssssss",
        $data['medical_name'],
        $data['date'],
        $data['id'],
        $data['name'],
        $data['passport'],
        $data['agent'],
        $data['laboratory'],
        $data['remarks']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $stmt->store_result();
    echo json_encode([
        "exists" => $stmt->num_rows > 0,
        "status" => "success"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>