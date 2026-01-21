<?php
// Admin - seçilen kullanıcının görevlerini listeler
require_once __DIR__ . '/../auth.php';

if ((int)$CURRENT_USER_ROLE !== 2) {
  error('Yetkisiz');
}

$userId = (int)($_POST['user_id'] ?? $_GET['user_id'] ?? 0);
if ($userId <= 0) {
  error('Geçersiz kullanıcı');
}

$stmt = $pdo->prepare("SELECT id, title, is_done, created_at FROM tasks WHERE user_id = :uid ORDER BY id DESC");
$stmt->execute(['uid' => $userId]);
$tasks = $stmt->fetchAll();

success(['tasks' => $tasks]);
