    // Logout modülü - Çıkış işlemini yönetir

class LogoutManager {
  constructor() {
    this.logoutBtn = document.getElementById('logoutBtn');
    this.modal = null;
    this.init();
  }

  // Logout manager başlatılır
  init() {
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.showConfirm());
    }
  }

  // Onay modal'ı göster
  showConfirm() {
    this.createModal();
    this.modal.classList.add('show');
  }

  // Modal HTML'i oluştur
  createModal() {
    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.className = 'modal';
      this.modal.innerHTML = `
        <div class="modal-content">
          <h3>Çıkış Yap</h3>
          <p>Uygulamadan çıkmak istediğinize emin misiniz?</p>
          <div class="modal-buttons">
            <button class="btn-confirm" id="confirmLogout">Evet, Çık</button>
            <button class="btn-cancel" id="cancelLogout">İptal</button>
          </div>
        </div>
      `;
      document.body.appendChild(this.modal);

      // Event listeners
      document.getElementById('confirmLogout').addEventListener('click', () => this.logout());
      document.getElementById('cancelLogout').addEventListener('click', () => this.closeModal());
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }
  }

  // Çıkış işlemi yap
  async logout() {
    try {
      const res = await fetch('crud.php?action=logout', { method: 'POST' });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Logout response parse error:', parseErr, text);
        showToast('Çıkış hatası: Sunucu yanıtı geçersiz', 'error');
        return;
      }

      if (data.ok) {
        showToast('Çıkış yapılıyor...', 'success');
        setTimeout(() => {
          window.location.href = 'login.php';
        }, 500);
      } else {
        showToast(data.message || 'Çıkış hatası', 'error');
      }
    } catch (err) {
      showToast('Çıkış hatası: ' + err.message, 'error');
      console.error(err);
    }
  }

  // Modal'ı kapat
  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('show');
    }
  }
}

// Sayfa yüklendiğinde logout manager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
  new LogoutManager();
});
