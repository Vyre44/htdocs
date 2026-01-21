<?php
// api/trash_list.php - Çöp kutusu listesi
require_once __DIR__ . '/../auth.php';

// Admin belirli kullanıcının çöpünü görebilir
$requestedUserId = (int)($_POST['user_id'] ?? $_GET['user_id'] ?? 0);
$targetUserId = $CURRENT_USER_ID;

if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

$stmt = $pdo->prepare("SELECT * FROM trash WHERE user_id = :user_id ORDER BY deleted_at DESC, id DESC");
$stmt->execute(['user_id' => $targetUserId]);
$rows = $stmt->fetchAll();

success(["items" => $rows]);
