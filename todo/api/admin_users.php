<?php
// Admin - kullanıcı listesini getirir
require_once __DIR__ . '/../auth.php';

// Sadece admin (role=2) erişebilir
if ((int)$CURRENT_USER_ROLE !== 2) {
  error('Yetkisiz');
}

$sql = "SELECT u.id, u.username, u.email, u.role, u.created_at,
               (SELECT COUNT(*) FROM tasks t WHERE t.user_id = u.id) AS task_count
        FROM users u
        ORDER BY u.created_at DESC";

$stmt = $pdo->query($sql);
$users = $stmt->fetchAll();

success(['users' => $users]);
