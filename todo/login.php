<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Giriş Yap - To-Do</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Giriş Yap</h2>
      
      <form id="loginForm" class="auth-form">
        <div class="form-group">
          <label for="username">Kullanıcı Adı veya Email</label>
          <input type="text" id="username" name="username" required autocomplete="username">
        </div>

        <div class="form-group">
          <label for="password">Şifre</label>
          <input type="password" id="password" name="password" required autocomplete="current-password">
        </div>

        <button type="submit" class="btn-primary">Giriş Yap</button>
      </form>

      <div class="auth-footer">
        <p>Hesabın yok mu? <a href="register.php">Kayıt Ol</a></p>
      </div>
    </div>
  </div>

  <script src="js/utils.js"></script>
  <script src="js/login.js"></script>
</body>
</html>
