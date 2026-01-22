<?php
// api/list.php - Task listesini getir
require_once __DIR__ . '/../auth.php';

// Sadece giriş yapan kullanıcının tasklerini getir
$stmt = $pdo->prepare("
  SELECT * 
  FROM tasks 
  WHERE user_id = :user_id
  ORDER BY status ASC, sort_order ASC, id DESC
");
$stmt->execute(['user_id' => $CURRENT_USER_ID]);
$tasks = $stmt->fetchAll();

success(["tasks" => $tasks]);
