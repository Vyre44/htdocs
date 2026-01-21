<?php
// api/toggle.php - Task tamamlandı durumunu değiştir
require_once __DIR__ . '/../auth.php';

$id = (int)($_POST["id"] ?? 0);
$is_done = (int)($_POST["is_done"] ?? -1);
$requestedUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;

// ID ve durum kontrolü
if ($id <= 0 || ($is_done !== 0 && $is_done !== 1)) {
  error("Geçersiz veri");
}

// Admin başka kullanıcı için değiştirebilir
$targetUserId = $CURRENT_USER_ID;
if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Durumu güncelle (sadece hedef kullanıcının taski)
$stmt = $pdo->prepare("UPDATE tasks SET is_done = :is_done WHERE id = :id AND user_id = :user_id");
$stmt->execute(["is_done" => $is_done, "id" => $id, "user_id" => $targetUserId]);

if ($stmt->rowCount() === 0) {
  error("Görev bulunamadı veya yetkiniz yok");
}

success(["id" => $id, "is_done" => $is_done, "user_id" => $targetUserId]);
