<?php
// api/clear_all.php - Tüm görevleri çöpe taşı
require_once __DIR__ . '/../auth.php';

// Kullanıcının tüm görevlerini al
$stmt = $pdo->prepare("SELECT id, title, image_path FROM tasks WHERE user_id = :user_id");
$stmt->execute(['user_id' => $CURRENT_USER_ID]);
$rows = $stmt->fetchAll();

// Çöpe ekle
foreach ($rows as $row) {
  $stmtTrash = $pdo->prepare("INSERT INTO trash (user_id, task_id, title, image_path) VALUES (:user_id, :task_id, :title, :image_path)");
  $stmtTrash->execute([
    "user_id" => $CURRENT_USER_ID,
    "task_id" => $row["id"],
    "title" => $row["title"],
    "image_path" => $row["image_path"] ?? null
  ]);
}

// Kullanıcının tüm görevlerini veritabanından sil
$stmt = $pdo->prepare("DELETE FROM tasks WHERE user_id = :user_id");
$stmt->execute(['user_id' => $CURRENT_USER_ID]);
$deleted = $stmt->rowCount();

success(["deleted" => $deleted]);
