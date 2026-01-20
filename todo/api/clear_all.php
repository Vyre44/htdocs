<?php
// api/clear_all.php - Tüm görevleri çöpe taşı

// Tüm görevleri al
$rows = $pdo->query("SELECT id, title, image_path FROM tasks")->fetchAll();

// Çöpe ekle
foreach ($rows as $row) {
  $stmtTrash = $pdo->prepare("INSERT INTO trash (task_id, title, image_path) VALUES (:task_id, :title, :image_path)");
  $stmtTrash->execute([
    "task_id" => $row["id"],
    "title" => $row["title"],
    "image_path" => $row["image_path"] ?? null
  ]);
}

// Tüm görevleri veritabanından sil
$stmt = $pdo->prepare("DELETE FROM tasks");
$stmt->execute();
$deleted = $stmt->rowCount();

success(["deleted" => $deleted]);
