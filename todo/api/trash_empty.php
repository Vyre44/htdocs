<?php
// api/trash_empty.php - Çöpü tamamen boşalt

// Resim yollarını al
$rows = $pdo->query("SELECT image_path FROM trash")->fetchAll();

// Tabloyu temizle
$pdo->exec("TRUNCATE TABLE trash");

// Dosyaları sil
foreach ($rows as $row) {
  if (!empty($row['image_path'])) {
    $filePath = __DIR__ . '/../' . $row['image_path'];
    if (file_exists($filePath)) {
      @unlink($filePath);
    }
  }
}

success(["ok" => true]);
