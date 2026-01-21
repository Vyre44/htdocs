<?php
// api/trash_empty.php - Çöpü tamamen boşalt
require_once __DIR__ . '/../auth.php';

// Sadece kullanıcının çöpünden resim yollarını al
$stmt = $pdo->prepare("SELECT image_path FROM trash WHERE user_id = :user_id");
$stmt->execute(['user_id' => $CURRENT_USER_ID]);
$rows = $stmt->fetchAll();

// Kullanıcının çöpünü temizle
$stmtDel = $pdo->prepare("DELETE FROM trash WHERE user_id = :user_id");
$stmtDel->execute(['user_id' => $CURRENT_USER_ID]);

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
