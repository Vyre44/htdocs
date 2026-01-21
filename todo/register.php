<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kayıt Ol - To-Do</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Kayıt Ol</h2>
      
      <form id="registerForm" class="auth-form">
        <div class="form-group">
          <label for="reg_username">Kullanıcı Adı</label>
          <input type="text" id="reg_username" name="username" required autocomplete="username">
          <small class="error-msg" id="username_error"></small>
        </div>

        <div class="form-group">
          <label for="reg_email">Email</label>
          <input type="email" id="reg_email" name="email" required autocomplete="email">
          <small class="error-msg" id="email_error"></small>
        </div>

        <div class="form-group">
          <label for="reg_name">İsim</label>
          <input type="text" id="reg_name" name="name" required autocomplete="given-name">
          <small class="error-msg" id="name_error"></small>
        </div>

        <div class="form-group">
          <label for="reg_lastname">Soyisim</label>
          <input type="text" id="reg_lastname" name="lastname" required autocomplete="family-name">
          <small class="error-msg" id="lastname_error"></small>
        </div>

        <div class="form-group">
          <label for="reg_phone">Telefon (Opsiyonel)</label>
          <input type="tel" id="reg_phone" name="phone" autocomplete="tel" pattern="[0-9]{10,15}" placeholder="0555123456" title="Telefon sadece sayılardan oluşmalı (10-15 haneli)">
        </div>

        <div class="form-group">
          <label for="reg_password">Şifre</label>
          <input type="password" id="reg_password" name="password" required autocomplete="new-password" minlength="6">
          <small class="error-msg" id="password_error"></small>
        </div>

        <div class="form-group">
          <label for="reg_password_confirm">Şifre Tekrar</label>
          <input type="password" id="reg_password_confirm" name="password_confirm" required autocomplete="new-password" minlength="6">
          <small class="error-msg" id="password_confirm_error"></small>
        </div>

        <button type="submit" class="btn-primary">Kayıt Ol</button>
      </form>

      <div class="auth-footer">
        <p>Zaten hesabın var mı? <a href="login.php">Giriş Yap</a></p>
      </div>
    </div>
  </div>

  <script src="js/utils.js"></script>
  <script src="js/register.js"></script>
</body>
</html>
