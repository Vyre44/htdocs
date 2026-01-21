<?php
// api/trash_empty.php - Çöpü tamamen boşalt
require_once __DIR__ . '/../auth.php';

// Admin belirli kullanıcının çöpünü boşaltabilir
$requestedUserId = (int)($_POST['user_id'] ?? 0);
$targetUserId = $CURRENT_USER_ID;

if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Kullanıcının çöpünden resim yollarını al
$stmt = $pdo->prepare("SELECT image_path FROM trash WHERE user_id = :user_id");
$stmt->execute(['user_id' => $targetUserId]);
$rows = $stmt->fetchAll();

// Kullanıcının çöpünü temizle
$stmtDel = $pdo->prepare("DELETE FROM trash WHERE user_id = :user_id");
$stmtDel->execute(['user_id' => $targetUserId]);

// Dosyaları sil
foreach ($rows as $row) {
  if (!empty($row['image_path'])) {
    $filePath = __DIR__ . '/../' . $row['image_path'];
    if (file_exists($filePath)) {
      @unlink($filePath);
    }
  }
}

success(["ok" => true]);
