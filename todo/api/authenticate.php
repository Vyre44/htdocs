<?php
// Kullanıcı giriş API - Username/email ve şifre kontrolü yapar, session başlatır

session_start();

// Form verilerini al ve temizle
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Boş alan kontrolü
if (empty($username) || empty($password)) {
  error('Kullanıcı adı ve şifre gerekli');
}

// Kullanıcıyı veritabanında ara (hem username hem email ile giriş yapılabilir)
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username OR email = :username");
$stmt->execute(['username' => $username]);
$user = $stmt->fetch();

// Kullanıcı bulunamadıysa hata
if (!$user) {
  error('Kullanıcı bulunamadı');
}

// Şifre doğrulaması (hash karşılaştırması)
if (!password_verify($password, $user['password'])) {
  error('Yanlış şifre');
}

// Rol haritası: 0 eski kullanıcı rolü → yeni düzende 1=kullanıcı, 2=admin
$role = (int)($user['role'] ?? 1);
if ($role === 0) {
  $role = 1;
}

// Başarılı giriş - Session'a kullanıcı bilgilerini kaydet
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $role;

success([
  'user_id' => $user['id'],
  'username' => $user['username'],
  'role' => $role
]);
