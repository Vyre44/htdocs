<?php
// api/toggle.php - Task tamamlandı durumunu değiştir

$id = (int)($_POST["id"] ?? 0);
$is_done = (int)($_POST["is_done"] ?? -1);

// ID ve durum kontrolü
if ($id <= 0 || ($is_done !== 0 && $is_done !== 1)) {
  error("Geçersiz veri");
}

// Durumu güncelle
$stmt = $pdo->prepare("UPDATE tasks SET is_done = :is_done WHERE id = :id");
$stmt->execute(["is_done" => $is_done, "id" => $id]);

success(["id" => $id, "is_done" => $is_done]);
