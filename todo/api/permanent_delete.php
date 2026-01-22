<?php
// api/permanent_delete.php - Görevi kalıcı silinenler listesine işaretle (status=4)
require_once __DIR__ . '/../auth.php';

$id = (int)($_POST["id"] ?? 0);
$requestedUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
if ($id <= 0) error("Geçersiz id");

// Admin başka kullanıcıya ait task için işlem yapabilir
$targetUserId = $CURRENT_USER_ID;
if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Task'ı al (sadece hedef kullanıcının taski)
$stmt = $pdo->prepare("SELECT id FROM tasks WHERE id = :id AND user_id = :user_id");
$stmt->execute(["id" => $id, "user_id" => $targetUserId]);
$task = $stmt->fetch();
if (!$task) error("Görev bulunamadı veya yetkiniz yok");

// Status'ü 4 yap (kalıcı silinenler - admin görünümü)
$stmtUpdate = $pdo->prepare("UPDATE tasks SET status = 4 WHERE id = :id");
$stmtUpdate->execute(["id" => $id]);

success(["id" => $id, "message" => "Görev kalıcı silinenlere taşındı"]);
