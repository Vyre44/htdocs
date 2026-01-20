<?php
// api/trash_restore.php - Çöpten geri al

$trashId = (int)($_POST['id'] ?? 0);
if ($trashId <= 0) error('Geçersiz id');

$stmt = $pdo->prepare("SELECT * FROM trash WHERE id = :id");
$stmt->execute(["id" => $trashId]);
$row = $stmt->fetch();
if (!$row) error('Kayıt bulunamadı');

// Yeni sort_order en sona
$max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order), 0) FROM tasks")->fetchColumn();
$newOrder = $max + 1;

// Görevi geri ekle
$stmtIns = $pdo->prepare("INSERT INTO tasks (title, is_done, sort_order, image_path) VALUES (:title, 0, :ord, :img)");
$stmtIns->execute([
  "title" => $row['title'],
  "ord" => $newOrder,
  "img" => $row['image_path']
]);
$newId = (int)$pdo->lastInsertId();

// Çöpten kaldır
$stmtDel = $pdo->prepare("DELETE FROM trash WHERE id = :id");
$stmtDel->execute(["id" => $trashId]);

success(["id" => $newId]);
