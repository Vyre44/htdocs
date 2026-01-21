// Login formu - Gerçek zamanlı validasyon ve farklı hata mesajlarıyla giriş kontrolü

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Input'a hata mesajı ve kırmızı border ekle
function showError(inputId, message) {
  const errorElement = document.getElementById(inputId + '_error');
  const inputElement = document.getElementById(inputId);
  if (errorElement && inputElement) {
    errorElement.textContent = message;
    inputElement.classList.add('input-error');
    inputElement.classList.remove('input-success');
  }
}

// Input'a yeşil border ekle (başarılı validasyon)
function showSuccess(inputId) {
  const errorElement = document.getElementById(inputId + '_error');
  const inputElement = document.getElementById(inputId);
  if (errorElement && inputElement) {
    errorElement.textContent = '';
    inputElement.classList.remove('input-error');
    inputElement.classList.add('input-success');
  }
}

// Username/email boş olmamalı ve 3+ karakter olmalı
function validateUsername() {
  const username = usernameInput.value.trim();
  if (username.length === 0) {
    showError('username', 'Kullanıcı adı veya email gerekli');
    return false;
  }
  if (username.length < 3) {
    showError('username', 'En az 3 karakter olmalı');
    return false;
  }
  showSuccess('username');
  return true;
}

// Şifre boş olmamalı ve 6+ karakter olmalı
function validatePassword() {
  const password = passwordInput.value;
  if (password.length === 0) {
    showError('password', 'Şifre gerekli');
    return false;
  }
  if (password.length < 6) {
    showError('password', 'Şifre en az 6 karakter olmalı');
    return false;
  }
  showSuccess('password');
  return true;
}

// Gerçek zamanlı kontrol: blur ve input event'lerinde validasyon çalışır
usernameInput.addEventListener('blur', validateUsername);
usernameInput.addEventListener('input', validateUsername);

passwordInput.addEventListener('blur', validatePassword);
passwordInput.addEventListener('input', validatePassword);

// Form gönderildiğinde API'ye istek at
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Önce tüm validasyonları çalıştır
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();

  if (!isUsernameValid || !isPasswordValid) {
    showToast('Lütfen tüm alanları doğru doldurun', 'error');
    return;
  }

  // FormData ile POST verisi hazırla
  const fd = new FormData();
  fd.append('username', username);
  fd.append('password', password);

  try {
    // API'ye login isteği gönder
    const res = await fetch('crud.php?action=authenticate', { method: 'POST', body: fd });
    const data = await res.json();

    if (!data.ok) {
      const errorMsg = data.message || 'Giriş başarısız';
      
      // Farklı hata türlerine göre özel mesajlar göster
      if (errorMsg.includes('Kullanıcı bulunamadı') || errorMsg.includes('bulunamadı')) {
        showError('username', 'Bu kullanıcı adı veya email kayıtlı değil');
        showToast('Kullanıcı bulunamadı. Kayıt olmak için tıklayın', 'error');
      } 
      else if (errorMsg.includes('Yanlış şifre') || errorMsg.includes('şifre')) {
        showError('password', 'Şifre hatalı');
        showToast('Şifre yanlış', 'error');
      }
      else {
        showToast(errorMsg, 'error');
      }
      return;
    }

    // Başarılı giriş - role'a göre yönlendir
    showToast('Giriş başarılı, yönlendiriliyorsunuz...', 'success');
    setTimeout(() => {
      if (data.role && Number(data.role) >= 2) {
        window.location.href = 'admin.php';
      } else {
        window.location.href = 'index.php';
      }
    }, 800);
  } catch (err) {
    showToast('Bağlantı hatası', 'error');
  }
});
