<?php
// api/add.php - Yeni task ekle

$title = trim($_POST["title"] ?? "");

if ($title === "") {
  error("Görev boş olamaz.");
}

// Mevcut en yüksek sırayı bul
$max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order), 0) FROM tasks")->fetchColumn();
$newOrder = $max + 1;

// Yeni task'ı ekle
$stmt = $pdo->prepare("INSERT INTO tasks (title, is_done, sort_order) VALUES (:title, 0, :ord)");
$stmt->execute(["title" => $title, "ord" => $newOrder]);

success(["id" => (int)$pdo->lastInsertId()]);
