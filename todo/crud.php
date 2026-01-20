<?php

//Gelen action'ı ilgili API dosyasına yönlendir
 

require "db.php";
require_once "api/helpers.php";

header("Content-Type: application/json; charset=utf-8");

$action = $_GET["action"] ?? "";

// Güvenlik: sadece alfanumerik karakterlere izin ver
if (!preg_match('/^[a-z]+$/', $action)) {
  error("Geçersiz action");
}

// İlgili action dosyasını yükle
$actionFile = "api/{$action}.php";

if (file_exists($actionFile)) {
  require $actionFile;
} else {
  error("Bilinmeyen action");
}

