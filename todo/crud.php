<?php
/**
 * crud.php - API Router
 * Gelen action'ı ilgili API dosyasına yönlendir
 */

require "db.php";
require "api/helpers.php";

header("Content-Type: application/json; charset=utf-8");

$action = $_GET["action"] ?? "";

// İlgili action dosyasını yükle
$actionFile = "api/{$action}.php";

if (file_exists($actionFile)) {
  require $actionFile;
} else {
  error("Bilinmeyen action");
}
