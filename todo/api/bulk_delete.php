<?php
// api/bulk_delete.php - Seçili görevleri çöpe taşı

$idsRaw = $_POST['ids'] ?? '';
$ids = array_filter(array_map('intval', explode(',', $idsRaw)));

if (count($ids) === 0) {
  error('Silinecek görev yok');
}

// Seçili görevleri al
$in  = implode(',', array_fill(0, count($ids), '?'));
$stmt = $pdo->prepare("SELECT id, title, image_path FROM tasks WHERE id IN ($in)");
$stmt->execute($ids);
$rows = $stmt->fetchAll();

// Çöpe ekle
foreach ($rows as $row) {
  $stmtTrash = $pdo->prepare("INSERT INTO trash (task_id, title, image_path) VALUES (:task_id, :title, :image_path)");
  $stmtTrash->execute([
    "task_id" => $row["id"],
    "title" => $row["title"],
    "image_path" => $row["image_path"] ?? null
  ]);
}

// Görevleri sil
$stmtDel = $pdo->prepare("DELETE FROM tasks WHERE id IN ($in)");
$stmtDel->execute($ids);
$deleted = $stmtDel->rowCount();

success(['deleted' => $deleted]);
