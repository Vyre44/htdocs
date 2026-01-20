<?php
// api/delete.php - Task sil (Çöp kutusuna taşı)

$id = (int)($_POST["id"] ?? 0);
if ($id <= 0) error("Geçersiz id");

// Task'ı al
$stmt = $pdo->prepare("SELECT id, title, image_path FROM tasks WHERE id = :id");
$stmt->execute(["id" => $id]);
$task = $stmt->fetch();
if (!$task) error("Görev bulunamadı");

// Çöpe ekle (resim silinmez)
$stmtTrash = $pdo->prepare("INSERT INTO trash (task_id, title, image_path) VALUES (:task_id, :title, :image_path)");
$stmtTrash->execute([
  "task_id" => $task["id"],
  "title" => $task["title"],
  "image_path" => $task["image_path"] ?? null
]);

// Orijinal task'ı sil
$stmtDel = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
$stmtDel->execute(["id" => $id]);

success(["id" => $id]);
