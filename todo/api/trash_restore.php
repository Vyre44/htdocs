<?php
// api/trash_restore.php - Çöpten geri al
require_once __DIR__ . '/../auth.php';

$trashId = (int)($_POST['id'] ?? 0);
if ($trashId <= 0) error('Geçersiz id');

// Admin belirli kullanıcının çöpünü geri yükleyebilir
$requestedUserId = (int)($_POST['user_id'] ?? 0);
$targetUserId = $CURRENT_USER_ID;

if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Çöp kaydını kontrol et
$stmt = $pdo->prepare("SELECT * FROM trash WHERE id = :id AND user_id = :user_id");
$stmt->execute(["id" => $trashId, "user_id" => $targetUserId]);
$row = $stmt->fetch();
if (!$row) error('Kayıt bulunamadı veya yetkiniz yok');

// Kullanıcının mevcut en yüksek sort_order'ı
$stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) FROM tasks WHERE user_id = :user_id");
$stmt->execute(['user_id' => $targetUserId]);
$max = (int)$stmt->fetchColumn();
$newOrder = $max + 1;

// Görevi geri ekle
$stmtIns = $pdo->prepare("INSERT INTO tasks (user_id, title, is_done, sort_order, image_path) VALUES (:user_id, :title, 0, :ord, :img)");
$stmtIns->execute([
  "user_id" => $targetUserId,
  "title" => $row['title'],
  "ord" => $newOrder,
  "img" => $row['image_path']
]);
$newId = (int)$pdo->lastInsertId();

// Çöpten kaldır
$stmtDel = $pdo->prepare("DELETE FROM trash WHERE id = :id");
$stmtDel->execute(["id" => $trashId]);

success(["id" => $newId]);
