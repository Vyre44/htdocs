<?php
// api/delete.php - Task sil (Çöp kutusuna taşı)
require_once __DIR__ . '/../auth.php';

$id = (int)($_POST["id"] ?? 0);
$requestedUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
if ($id <= 0) error("Geçersiz id");

// Admin başka kullanıcıya ait task için işlem yapabilir
$targetUserId = $CURRENT_USER_ID;
if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Task'ı al (sadece hedef kullanıcının taski)
$stmt = $pdo->prepare("SELECT id, title, image_path, user_id FROM tasks WHERE id = :id AND user_id = :user_id");
$stmt->execute(["id" => $id, "user_id" => $targetUserId]);
$task = $stmt->fetch();
if (!$task) error("Görev bulunamadı veya yetkiniz yok");

// Çöpe ekle (resim silinmez)
$stmtTrash = $pdo->prepare("INSERT INTO trash (user_id, task_id, title, image_path) VALUES (:user_id, :task_id, :title, :image_path)");
$stmtTrash->execute([
  "user_id" => $task["user_id"],
  "task_id" => $task["id"],
  "title" => $task["title"],
  "image_path" => $task["image_path"] ?? null
]);

// Orijinal task'ı sil
$stmtDel = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
$stmtDel->execute(["id" => $id]);

success(["id" => $id, "user_id" => $task["user_id"]]);
