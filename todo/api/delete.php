<?php
// api/delete.php - Task sil

$id = (int)($_POST["id"] ?? 0);

if ($id <= 0) {
  error("Geçersiz id");
}

// Task'ın fotoğrafını kontrol et
$stmt = $pdo->prepare("SELECT image_path FROM tasks WHERE id = :id");
$stmt->execute(["id" => $id]);
$task = $stmt->fetch();

// Task'ı veritabanından sil
$stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
$stmt->execute(["id" => $id]);

// Eğer fotoğraf varsa, fiziksel dosyayı da sil
if ($task && !empty($task["image_path"])) {
  $filePath = __DIR__ . "/../" . $task["image_path"];
  if (file_exists($filePath)) {
    @unlink($filePath); // @ ile sessizce sil (hata olsa da devam et)
  }
}

success(["id" => $id]);
