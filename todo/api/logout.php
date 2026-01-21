<?php
session_destroy();
// Oturum sonlandır - Çıkış işlemi

// Router (crud.php) zaten helpers'ı yükledi; yine de standalone çağrı için güvence altına al
if (!function_exists('success')) {
  require_once __DIR__ . '/helpers.php';
}

// Çıktı tamponlarını temizle, sadece JSON dön (parse hatasını önlemek için)
while (ob_get_level() > 0) {
  ob_end_clean();
}
header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// Session verilerini temizle
session_unset();
session_destroy();

success(['message' => 'Oturum kapatıldı']);
