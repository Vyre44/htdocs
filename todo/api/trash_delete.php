<?php
// api/trash_delete.php - Çöpten kalıcı olarak sil
require_once __DIR__ . '/../auth.php';

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) error('Geçersiz id');

// Çöpteki kayıt (sadece kullanıcının kendi çöpü)
$stmt = $pdo->prepare("SELECT * FROM trash WHERE id = :id AND user_id = :user_id");
$stmt->execute(["id" => $id, "user_id" => $CURRENT_USER_ID]);
$row = $stmt->fetch();
if (!$row) error('Kayıt bulunamadı veya yetkiniz yok');

// Resim dosyasını sil
if (!empty($row['image_path'])) {
  $filePath = __DIR__ . '/../' . $row['image_path'];
  if (file_exists($filePath)) {
    @unlink($filePath);
  }
}

// Çöpten kaldır
$stmtDel = $pdo->prepare("DELETE FROM trash WHERE id = :id");
$stmtDel->execute(["id" => $id]);

success(["id" => $id]);
