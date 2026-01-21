<?php
// api/register_process.php - Yeni kullanıcı kaydı

$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$name = trim($_POST['name'] ?? '');
$lastname = trim($_POST['lastname'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';

// Telefon validasyonu (opsiyonel ama girildiyse sadece sayı)
if (!empty($phone)) {
  if (!preg_match('/^[0-9]{10,15}$/', $phone)) {
    error('Telefon sadece sayılardan oluşmalı ve 10-15 haneli olmalı');
  }
}

// Validasyon
if (empty($username) || empty($email) || empty($name) || empty($lastname) || empty($password)) {
  error('Tüm zorunlu alanları doldurun');
}

// Kullanıcı adı kontrolü (en az 3 karakter)
if (strlen($username) < 3) {
  error('Kullanıcı adı en az 3 karakter olmalı');
}

if (strlen($password) < 6) {
  error('Şifre en az 6 karakter olmalı');
}

// Email formatı kontrolü
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  error('Geçersiz email adresi');
}

// Email detaylı kontrolleri
$emailParts = explode('@', $email);
if (count($emailParts) !== 2) {
  error('Geçersiz email formatı');
}

// @ işaretinden önceki kısım en az 3 karakter
if (strlen($emailParts[0]) < 3) {
  error('Email kullanıcı adı en az 3 karakter olmalı');
}

// Domain kontrolü
// Email domain kontrolü - Sadece belirli sağlayıcılar veya uzantılar kabul edilir
$domain = strtolower($emailParts[1]);
$validDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yandex.com', 'icloud.com'];
$validExtensions = ['com', 'net', 'org', 'edu', 'gov', 'tr', 'uk', 'de'];

$isValidDomain = in_array($domain, $validDomains);
$hasValidExtension = false;

// Domain uzantısını kontrol et (.com, .net vb.)
foreach ($validExtensions as $ext) {
  if (substr($domain, -strlen(".$ext")) === ".$ext") {
    $hasValidExtension = true;
    break;
  }
}

if (!$isValidDomain && !$hasValidExtension) {
  error('Geçerli bir email sağlayıcısı kullanın (gmail.com, hotmail.com vb.)');
}

// Kullanıcı adı veya email kontrolü
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
$stmt->execute(['username' => $username, 'email' => $email]);
if ($stmt->fetch()) {
  error('Bu kullanıcı adı veya email zaten kullanılıyor');
}

// Şifreyi hashle
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Kullanıcı ekle (rol: 1 = kullanıcı, 2 = admin)
$stmtInsert = $pdo->prepare("INSERT INTO users (username, email, name, lastname, phone, password, role) VALUES (:username, :email, :name, :lastname, :phone, :password, :role)");
$stmtInsert->execute([
  'username' => $username,
  'email' => $email,
  'name' => $name,
  'lastname' => $lastname,
  'phone' => !empty($phone) ? $phone : null,
  'password' => $hashedPassword,
  'role' => 1 // varsayılan: kullanıcı
]);

$userId = (int)$pdo->lastInsertId();

success(['id' => $userId, 'username' => $username]);
