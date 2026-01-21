<?php
// api/trash_list.php - Çöp kutusu listesi
require_once __DIR__ . '/../auth.php';

// Sadece kullanıcının kendi çöpü
$stmt = $pdo->prepare("SELECT * FROM trash WHERE user_id = :user_id ORDER BY deleted_at DESC, id DESC");
$stmt->execute(['user_id' => $CURRENT_USER_ID]);
$rows = $stmt->fetchAll();

success(["items" => $rows]);
