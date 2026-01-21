<?php
// api/reorder.php - Task sırasını kaydet
require_once __DIR__ . '/../auth.php';

$orderRaw = $_POST["order"] ?? "";

if ($orderRaw === "") {
  error("Sıra boş");
}

// ID'leri array'e çevir ve temizle
$ids = array_filter(array_map("intval", explode(",", $orderRaw)));

if (count($ids) === 0) {
  error("Geçersiz sıra");
}

// Transaction başlat
$pdo->beginTransaction();
try {
  // Sadece kullanıcının kendi tasklerini güncelle
  $stmt = $pdo->prepare("UPDATE tasks SET sort_order = :ord WHERE id = :id AND user_id = :user_id");
  $ord = 1;
  // Her task için yeni sırayı kaydet
  foreach ($ids as $oneId) {
    $stmt->execute(["ord" => $ord, "id" => $oneId, "user_id" => $CURRENT_USER_ID]);
    $ord++;
  }
  $pdo->commit();
  success();
} catch (Exception $e) {
  $pdo->rollBack();
  error("Sıralama kaydedilemedi");
}
