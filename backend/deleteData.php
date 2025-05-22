<?php
header('Content-Type: application/json');
include 'db_config.php'; // Ensure your database connection is properly set up

$data = json_decode(file_get_contents('php://input'), true);
$response = ['status' => 'error', 'message' => 'Failed to delete data'];

if (!empty($data['id'])) {
    $id = $data['id'];
    $section = isset($data['section']) ? $data['section'] : 'submitted'; // Default to 'submitted'

    // Begin a transaction to ensure atomicity
    $conn->begin_transaction();

    try {
        if ($section === 'submitted') {
            // Delete from `temporary_medical_data` for Submitted Data section
            $stmt = $conn->prepare("DELETE FROM temporary_medical_data WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                $conn->commit(); // Commit transaction if deletion is successful
                $response = ['status' => 'success', 'message' => 'Data deleted successfully from Submitted Data'];
            } else {
                $conn->rollback(); // Rollback if no record was found
                $response['message'] = 'No matching record found in Submitted Data';
            }

            $stmt->close();
        } elseif ($section === 'all_reports') {
            // Delete from `medical_data` for All Reports section
            $stmt = $conn->prepare("DELETE FROM medical_data WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                $conn->commit(); // Commit transaction if deletion is successful
                $response = ['status' => 'success', 'message' => 'Data deleted successfully from All Reports'];
            } else {
                $conn->rollback(); // Rollback if no record was found
                $response['message'] = 'No matching record found in All Reports';
            }

            $stmt->close();
        } else {
            $response['message'] = 'Invalid section specified';
        }
    } catch (Exception $e) {
        $conn->rollback(); // Rollback in case of any error
        $response['message'] = 'Error deleting record: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'No ID received';
}

$conn->close();
echo json_encode($response);
?>