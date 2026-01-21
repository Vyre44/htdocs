// Kayıt formu - Gerçek zamanlı validasyon ve sağ tarafta gereksinimler listesi

const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('reg_username');
const emailInput = document.getElementById('reg_email');
const nameInput = document.getElementById('reg_name');
const lastnameInput = document.getElementById('reg_lastname');
const passwordInput = document.getElementById('reg_password');
const passwordConfirmInput = document.getElementById('reg_password_confirm');

// Input altına hata mesajı yaz ve kırmızı border ekle
function showError(inputId, message) {
  const errorElement = document.getElementById(inputId + '_error');
  const inputElement = document.getElementById(inputId);
  if (errorElement && inputElement) {
    errorElement.textContent = message;
    inputElement.classList.add('input-error');
    inputElement.classList.remove('input-success');
  }
}

// Input'a yeşil border ekle (geçerli durumda)
function showSuccess(inputId) {
  const errorElement = document.getElementById(inputId + '_error');
  const inputElement = document.getElementById(inputId);
  if (errorElement && inputElement) {
    errorElement.textContent = '';
    inputElement.classList.remove('input-error');
    inputElement.classList.add('input-success');
  }
}

// Sağdaki gereksinimler listesini güncelle (✓ veya ✗ ekle)
function updateRequirement(reqId, isValid) {
  const reqElement = document.getElementById(reqId);
  if (reqElement) {
    reqElement.classList.remove('valid', 'invalid');
    if (isValid === true) {
      reqElement.classList.add('valid'); // ✓ yeşil
    } else if (isValid === false) {
      reqElement.classList.add('invalid'); // ✗ kırmızı
    }
  }
}

// Kullanıcı adı validasyonu
function validateUsername() {
  const username = usernameInput.value.trim();
  if (username.length === 0) {
    showError('reg_username', 'Kullanıcı adı gerekli');
    return false;
  }
  if (username.length < 3) {
    showError('reg_username', 'Kullanıcı adı en az 3 karakter olmalı');
    return false;
  }
  showSuccess('reg_username');
  return true;
}

// Email validasyonu
function validateEmail() {
  const email = emailInput.value.trim();
  if (email.length === 0) {
    showError('reg_email', 'Email gerekli');
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    showError('reg_email', 'Geçersiz email formatı (örn: kullanici@gmail.com)');
    return false;
  }

  const emailUser = email.split('@')[0];
  if (emailUser.length < 3) {
    showError('reg_email', 'Email kullanıcı adı en az 3 karakter olmalı');
    return false;
  }

  const emailDomain = email.split('@')[1]?.toLowerCase();
  const validDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yandex.com', 'icloud.com'];
  const hasValidDomain = validDomains.some(domain => emailDomain === domain) || 
                         emailDomain?.match(/\.(com|net|org|edu|gov|tr|uk|de)$/);
  
  if (!hasValidDomain) {
    showError('reg_email', 'Geçerli bir email sağlayıcısı kullanın');
    return false;
  }

  showSuccess('reg_email');
  return true;
}

// İsim validasyonu
function validateName() {
  const name = nameInput.value.trim();
  if (name.length === 0) {
    showError('reg_name', 'İsim gerekli');
    return false;
  }
  if (name.length < 2) {
    showError('reg_name', 'İsim en az 2 karakter olmalı');
    return false;
  }
  showSuccess('reg_name');
  return true;
}

// Soyisim validasyonu
function validateLastname() {
  const lastname = lastnameInput.value.trim();
  if (lastname.length === 0) {
    showError('reg_lastname', 'Soyisim gerekli');
    return false;
  }
  if (lastname.length < 2) {
    showError('reg_lastname', 'Soyisim en az 2 karakter olmalı');
    return false;
  }
  showSuccess('reg_lastname');
  return true;
}

// Şifre validasyonu
function validatePassword() {
  const password = passwordInput.value;
  if (password.length === 0) {
    showError('reg_password', 'Şifre gerekli');
    return false;
  }
  if (password.length < 6) {
    showError('reg_password', 'Şifre en az 6 karakter olmalı');
    return false;
  }
  showSuccess('reg_password');
  return true;
}

// Şifre tekrar validasyonu
function validatePasswordConfirm() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  
  if (passwordConfirm.length === 0) {
    showError('reg_password_confirm', 'Şifre tekrarı gerekli');
    return false;
  }
  if (password !== passwordConfirm) {
    showError('reg_password_confirm', 'Şifreler eşleşmiyor');
    return false;
  }
  showSuccess('reg_password_confirm');
  return true;
}

// Event listener'lar (gerçek zamanlı kontrol)
usernameInput.addEventListener('blur', validateUsername);
usernameInput.addEventListener('input', validateUsername);

emailInput.addEventListener('blur', validateEmail);
emailInput.addEventListener('input', validateEmail);

nameInput.addEventListener('blur', validateName);
nameInput.addEventListener('input', validateName);

lastnameInput.addEventListener('blur', validateLastname);
lastnameInput.addEventListener('input', validateLastname);

passwordInput.addEventListener('blur', validatePassword);
passwordInput.addEventListener('input', () => {
  validatePassword();
  // Şifre değişince confirm'i de kontrol et
  if (passwordConfirmInput.value.length > 0) validatePasswordConfirm();
});

passwordConfirmInput.addEventListener('blur', validatePasswordConfirm);
passwordConfirmInput.addEventListener('input', validatePasswordConfirm);

// Form submit
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const name = nameInput.value.trim();
  const lastname = lastnameInput.value.trim();
  const phone = document.getElementById('reg_phone').value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  // Tüm validasyonları çalıştır
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isNameValid = validateName();
  const isLastnameValid = validateLastname();
  const isPasswordValid = validatePassword();
  const isPasswordConfirmValid = validatePasswordConfirm();

  // Herhangi biri geçersizse dur
  if (!isUsernameValid || !isEmailValid || !isNameValid || !isLastnameValid || !isPasswordValid || !isPasswordConfirmValid) {
    showToast('Lütfen tüm alanları doğru doldurun', 'error');
    return;
  }

  const fd = new FormData();
  fd.append('username', username);
  fd.append('email', email);
  fd.append('name', name);
  fd.append('lastname', lastname);
  fd.append('phone', phone);
  fd.append('password', password);

  try {
    const res = await fetch('crud.php?action=register_process', { method: 'POST', body: fd });
    const data = await res.json();

    if (!data.ok) {
      showToast(data.message || 'Kayıt başarısız', 'error');
      return;
    }

    showToast('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
    setTimeout(() => {
      window.location.href = 'login.php';
    }, 1500);
  } catch (err) {
    showToast('Bağlantı hatası', 'error');
  }
});
