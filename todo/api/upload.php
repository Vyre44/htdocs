<?php
/**
 * api/upload.php - Resim yükle
 */

$id = (int)($_POST["id"] ?? 0);

if ($id <= 0) {
  error("Geçersiz id");
}

if (!isset($_FILES["image"])) {
  error("Dosya gelmedi");
}

$file = $_FILES["image"];

if ($file["error"] !== UPLOAD_ERR_OK) {
  error("Yükleme hatası: " . $file["error"]);
}

// 1MB limit
if ($file["size"] > 1024 * 1024) {
  error("Dosya 1MB üstü olamaz.");
}

// JPEG kontrolü
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file["tmp_name"]);
if ($mime !== "image/jpeg") {
  error("Sadece JPEG (JPG) kabul edilir.");
}

// Benzersiz dosya adı oluştur
$name = "task_" . $id . "_" . time() . ".jpg";
$targetPath = $uploadDir . "/" . $name;

if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
  error("Dosya kaydedilemedi.");
}

// Veritabanına web yolunu kaydet
$webPath = "uploads/" . $name;
$stmt = $pdo->prepare("UPDATE tasks SET image_path = :p WHERE id = :id");
$stmt->execute(["p" => $webPath, "id" => $id]);

success(["image_path" => $webPath]);
