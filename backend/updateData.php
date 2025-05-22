<?php
require_once 'db_config.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['id'])) {
        throw new Exception("Missing or invalid ID");
    }

    $sql = "UPDATE temporary_medical_data SET 
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
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param(
        "ssssssss",
        $data['medical_name'],
        $data['date'],
        $data['name'],
        $data['passport'],
        $data['agent'],
        $data['laboratory'],
        $data['remarks'],
        $data['id']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Data updated successfully"
        ]);
    } else {
        throw new Exception("Update failed: " . $stmt->error);
    }
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
