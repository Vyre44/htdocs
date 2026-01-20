<?php
require __DIR__ . "/../db.php";
require_once __DIR__ . "/helpers.php";

$id = (int)($_POST["id"] ?? 0);
if ($id <= 0) error("Geçersiz id");

// Eski fotoğrafı kontrol et ve sil
$stmt = $pdo->prepare("SELECT image_path FROM tasks WHERE id = :id");
$stmt->execute(["id" => $id]);
$oldTask = $stmt->fetch();

if ($oldTask && !empty($oldTask["image_path"])) {
  $oldFile = __DIR__ . "/../" . $oldTask["image_path"];
  if (file_exists($oldFile)) {
    @unlink($oldFile); // Eski dosyayı sil
  }
}

if (!isset($_FILES["image"])) error("Dosya gelmedi");

$file = $_FILES["image"];

if ($file["error"] !== UPLOAD_ERR_OK) {
  error("Yükleme hatası: " . $file["error"]);
}

// 1MB limit
if ($file["size"] > 1024 * 1024) {
  error("Dosya 1MB üstü olamaz.");
}

// sadece JPEG (MIME)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file["tmp_name"]);
if ($mime !== "image/jpeg") {
  error("Sadece JPEG (JPG) kabul edilir.");
}

// uploads klasörü (todo/uploads)
$uploadDir = realpath(__DIR__ . "/../uploads");
if ($uploadDir === false) error("uploads klasörü bulunamadı.");

$filename = "task_" . $id . "_" . time() . ".jpg";
$target = $uploadDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($file["tmp_name"], $target)) {
  error("Dosya kaydedilemedi.");
}

// Web path (dinamik)
$webPath = "uploads/" . $filename;

// DB update
$stmt = $pdo->prepare("UPDATE tasks SET image_path = :p WHERE id = :id");
$stmt->execute(["p" => $webPath, "id" => $id]);

success(["image_path" => $webPath]);
