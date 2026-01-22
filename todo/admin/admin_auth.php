<?php
// Admin Authentication Middleware
// Giriş kontrolü ve admin role kontrolü

require_once __DIR__ . '/../auth.php';

// Admin değilse normal kullanıcı sayfasına yönlendir
if ((int)$CURRENT_USER_ROLE !== 2) {
  header('Location: ../index.php');
  exit;
}
  