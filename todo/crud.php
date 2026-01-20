<?php
require "db.php";
header("Content-Type: application/json; charset=utf-8");

$action = $_GET["action"] ?? "";

function out($arr) {
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($action === "list") {
  $tasks = $pdo->query("
    SELECT * 
    FROM tasks 
    ORDER BY is_done ASC, sort_order ASC, id DESC
  ")->fetchAll();
  out(["ok" => true, "tasks" => $tasks]);
}

if ($action === "add") {
  $title = trim($_POST["title"] ?? "");
  if ($title === "") out(["ok" => false, "message" => "Görev boş olamaz."]);

  $max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order), 0) FROM tasks")->fetchColumn();
  $newOrder = $max + 1;

  $stmt = $pdo->prepare("INSERT INTO tasks (title, is_done, sort_order) VALUES (:title, 0, :ord)");
  $stmt->execute(["title" => $title, "ord" => $newOrder]);

  out(["ok" => true, "id" => (int)$pdo->lastInsertId()]);
}

if ($action === "toggle") {
  $id = (int)($_POST["id"] ?? 0);
  $is_done = (int)($_POST["is_done"] ?? -1);

  if ($id <= 0 || ($is_done !== 0 && $is_done !== 1)) {
    out(["ok" => false, "message" => "Geçersiz veri"]);
  }

  $stmt = $pdo->prepare("UPDATE tasks SET is_done = :is_done WHERE id = :id");
  $stmt->execute(["is_done" => $is_done, "id" => $id]);

  out(["ok" => true, "id" => $id, "is_done" => $is_done]);
}

if ($action === "delete") {
  $id = (int)($_POST["id"] ?? 0);
  if ($id <= 0) out(["ok" => false, "message" => "Geçersiz id"]);

  $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
  $stmt->execute(["id" => $id]);

  out(["ok" => true, "id" => $id]);
}

 if ($action === "upload") {
  $id = (int)($_POST["id"] ?? 0);
  if ($id <= 0) out(["ok" => false, "message" => "Geçersiz id"]);

  if (!isset($_FILES["image"])) out(["ok" => false, "message" => "Dosya gelmedi"]);

  $file = $_FILES["image"];

  if ($file["error"] !== UPLOAD_ERR_OK) {
    out(["ok" => false, "message" => "Yükleme hatası: " . $file["error"]]);
  }

  // 1MB limit
  if ($file["size"] > 1024 * 1024) {
    out(["ok" => false, "message" => "Dosya 1MB üstü olamaz."]);
  }

  // JPEG kontrolü
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($file["tmp_name"]);
  if ($mime !== "image/jpeg") { // sadece JPEG
    out(["ok" => false, "message" => "Sadece JPEG (JPG) kabul edilir."]);
  }

  // benzersiz isim
  $name = "task_" . $id . "_" . time() . ".jpg";
  $targetPath = $uploadDir . "/" . $name;

  if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
    out(["ok" => false, "message" => "Dosya kaydedilemedi."]); // kaydetme hatası 
  }

  // DB'ye web yolu yaz
  $webPath = "uploads/" . $name;
  $stmt = $pdo->prepare("UPDATE tasks SET image_path = :p WHERE id = :id");
  $stmt->execute(["p" => $webPath, "id" => $id]);

  out(["ok" => true, "image_path" => $webPath]);
}


if ($action === "reorder") {
  $orderRaw = $_POST["order"] ?? "";
  if ($orderRaw === "") out(["ok" => false, "message" => "Sıra boş"]);

  $ids = array_filter(array_map("intval", explode(",", $orderRaw)));
  if (count($ids) === 0) out(["ok" => false, "message" => "Geçersiz sıra"]);

  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare("UPDATE tasks SET sort_order = :ord WHERE id = :id");
    $ord = 1;
    foreach ($ids as $oneId) {
      $stmt->execute(["ord" => $ord, "id" => $oneId]);
      $ord++;
    }
    $pdo->commit();
    out(["ok" => true]);
  } catch (Exception $e) {
    $pdo->rollBack();
    out(["ok" => false, "message" => "Sıralama kaydedilemedi"]);
  }
}

// ✅ En sonda kalmalı
out(["ok" => false, "message" => "Bilinmeyen action"]);
