<?php
// api/add.php - Yeni task ekle
require_once __DIR__ . '/../auth.php';

$title = trim($_POST["title"] ?? "");
$requestedUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;

if ($title === "") {
  error("Görev boş olamaz.");
}

// Admin başka kullanıcı için ekleme yapabilir
$targetUserId = $CURRENT_USER_ID;
if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Kullanıcının mevcut en yüksek sırayı bul
$stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) FROM tasks WHERE user_id = :user_id");
$stmt->execute(['user_id' => $targetUserId]);
$max = (int)$stmt->fetchColumn();
$newOrder = $max + 1;

// Yeni task'ı ekle
$stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, is_done, sort_order) VALUES (:user_id, :title, 0, :ord)");
$stmt->execute(["user_id" => $targetUserId, "title" => $title, "ord" => $newOrder]);

success(["id" => (int)$pdo->lastInsertId(), "user_id" => $targetUserId]);
