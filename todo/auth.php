<?php
// Middleware: Login kontrolü - Giriş yapmayan kullanıcıları login.php'ye yönlendirir

session_start();

// Session'da user_id yoksa giriş yapılmamış demektir
if (!isset($_SESSION['user_id'])) {
  header('Location: login.php');
  exit;
}

// Oturum verilerini global değişkenlere aktar (API'lerde kullanılacak)
$CURRENT_USER_ID = $_SESSION['user_id'];
$CURRENT_USERNAME = $_SESSION['username'] ?? '';
$CURRENT_USER_ROLE = $_SESSION['role'] ?? 0;
