<?php
/**
 * api/delete.php - Task sil
 */

$id = (int)($_POST["id"] ?? 0);

if ($id <= 0) {
  error("Geçersiz id");
}

$stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
$stmt->execute(["id" => $id]);

success(["id" => $id]);
