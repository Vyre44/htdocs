<?php
// api/bulk_delete.php - Seçili görevleri çöpe taşı

require_once __DIR__ . '/../auth.php';

// Görev id'lerini al
$idsRaw = $_POST['ids'] ?? '';
$ids = array_filter(array_map('intval', explode(',', $idsRaw)));
// eğer silinecek görev yoksa hata ver
if (count($ids) === 0) {
  error('Silinecek görev yok');
}

// Seçili görevleri al (sadece kullanıcının kendi taskleri)
$in  = implode(',', array_fill(0, count($ids), '?'));
$stmt = $pdo->prepare("SELECT id, title, image_path FROM tasks WHERE id IN ($in) AND user_id = ?");
$stmt->execute(array_merge($ids, [$CURRENT_USER_ID]));
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

// Görevleri sil
$stmtDel = $pdo->prepare("DELETE FROM tasks WHERE id IN ($in) AND user_id = ?");
$stmtDel->execute(array_merge($ids, [$CURRENT_USER_ID]));
$deleted = $stmtDel->rowCount();

success(['deleted' => $deleted]);
