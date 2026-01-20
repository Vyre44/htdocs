<?php
// crud.php - API Router
// Gelen action'ı ilgili API dosyasına yönlendir

require "db.php";
require_once "api/helpers.php";

header("Content-Type: application/json; charset=utf-8");

$action = $_GET["action"] ?? "";

// Güvenlik: sadece küçük harf ve alt çizgi
if (!preg_match('/^[a-z_]+$/', $action)) {
  error("Geçersiz action");
}

// İlgili action dosyasını yükle
$actionFile = "api/{$action}.php";

if (file_exists($actionFile)) {
  require $actionFile;
} else {
  error("Bilinmeyen action");
}

