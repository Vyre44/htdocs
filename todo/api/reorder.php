<?php
// api/reorder.php - Task sırasını kaydet

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
  $stmt = $pdo->prepare("UPDATE tasks SET sort_order = :ord WHERE id = :id");
  $ord = 1;
  // Her task için yeni sırayı kaydet
  foreach ($ids as $oneId) {
    $stmt->execute(["ord" => $ord, "id" => $oneId]);
    $ord++;
  }
  $pdo->commit();
  success();
} catch (Exception $e) {
  $pdo->rollBack();
  error("Sıralama kaydedilemedi");
}
