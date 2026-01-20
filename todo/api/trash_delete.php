<?php
// api/trash_delete.php - Çöpten kalıcı olarak sil

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) error('Geçersiz id');

// Çöpteki kayıt
$stmt = $pdo->prepare("SELECT * FROM trash WHERE id = :id");
$stmt->execute(["id" => $id]);
$row = $stmt->fetch();
if (!$row) error('Kayıt bulunamadı');

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
