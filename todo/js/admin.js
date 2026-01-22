// admin.js - Admin paneli işlemleri

// Admin paneli veri depolama
let usersData = [];           // Tüm kullanıcılar listesi
let selectedUserId = null;    // Şu anda seçili kullanıcı ID'si
let trashData = [];           // Seçili kullanıcının çöp kutusu verileri
const addTaskBtn = document.getElementById('addTaskBtn');       // Ekle butonu
const newTaskTitle = document.getElementById('newTaskTitle');   // Görev başlığı input'u
const userSelect = document.getElementById('userSelect');       // Kullanıcı dropdown (tasks.php)

// Role'e göre badge (rozet) oluştur - Admin=kırmızı, Kullanıcı=yeşil
function roleBadge(role) {
  const r = Number(role) || 1;
  const label = r >= 2 ? 'Admin' : 'Kullanıcı';
  const cls = r >= 2 ? 'bg-danger' : 'bg-success';
  return `<span class="badge ${cls} role-badge">${label}</span>`;
}

// API'den tüm kullanıcıları getir ve tabloyu oluştur
async function fetchUsers() {
  try {
    const res = await fetch('../crud.php?action=admin_users');
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Kullanıcılar alınamadı');
    usersData = data.users || [];
    renderUsers();
    populateUserSelect(usersData);

    // URL'den user_id geldiyse onu seç, yoksa ilk kullanıcıyı seç
    const initialId = getQueryParam('user_id');
    const initialUser = initialId ? usersData.find((u) => Number(u.id) === Number(initialId)) : usersData[0];
    if (initialUser) {
      selectUser(initialUser.id, initialUser.username);
      if (userSelect) userSelect.value = initialUser.id;
    }
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Kullanıcı tablosunu HTML ile oluştur ve buton eventlerini bağla
function renderUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  if (!tbody) return; // Kullanıcılar sayfası dışındaysak tablo yok
  tbody.innerHTML = '';
  const userCountEl = document.getElementById('userCount');
  if (userCountEl) userCountEl.textContent = `${usersData.length} kullanıcı`;

  usersData.forEach((u) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${escapeHtml(u.username)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${roleBadge(u.role)}</td>
      <td>${u.task_count ?? 0}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-user-id="${u.id}" data-username="${escapeHtml(u.username)}">
          Görevleri Gör
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Butonlara tıklandığında görevleri getir
  tbody.querySelectorAll('button[data-user-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uid = Number(btn.dataset.userId);
      const uname = btn.dataset.username;
      selectUser(uid, uname);
    });
  });
}

// Dropdown'u doldur ve change event'i bağla (tasks.php sayfası için)
function populateUserSelect(list) {
  if (!userSelect) return;
  userSelect.innerHTML = '<option value="">-- Kullanıcı Seç --</option>';
  list.forEach((u) => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.username;
    userSelect.appendChild(opt);
  });

  userSelect.addEventListener('change', () => {
    const uid = Number(userSelect.value);
    const u = usersData.find((x) => Number(x.id) === uid);
    if (u) selectUser(u.id, u.username);
  });
}

// Kullanıcı seç: başlıkları güncelle ve görevler/çöp kutusunu yükle
async function selectUser(userId, username) {
  selectedUserId = userId;
  document.getElementById('tasksTitle').textContent = `Görevler - ${username}`;
  document.getElementById('trashTitle').textContent = `Çöp Kutusu - ${username}`;
  await fetchTasks(userId);
  await fetchTrash(userId);
}

// Seçili kullanıcının görevlerini API'den getir
async function fetchTasks(userId) {
  try {
    const fd = new FormData();
    fd.append('user_id', userId);
    const res = await fetch('../crud.php?action=admin_user_tasks', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Görevler alınamadı');
    const allTasks = data.tasks || [];
    const activeTasks = allTasks.filter(t => Number(t.status) !== 4); // 0,1,2,3 göster; 4 kalıcı silinenler
    trashData = allTasks.filter(t => Number(t.status) === 4);
    renderTasks(activeTasks);
    renderTrash();
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Görev tablosunu HTML ile oluştur, durum/silme butonlarına event bağla
function renderTasks(tasks) {
  const tbody = document.querySelector('#tasksTable tbody');
  tbody.innerHTML = '';
  document.getElementById('taskCount').textContent = `${tasks.length} görev`;

  tasks.forEach((t) => {
    const tr = document.createElement('tr');
    const statusVal = Number(t.status ?? 0);
    const badges = {
      0: '<span class="badge bg-danger">Çöp Kutusunda</span>',
      1: '<span class="badge bg-primary">Başlanmadı</span>',
      2: '<span class="badge bg-warning text-dark">Devam Ediyor</span>',
      3: '<span class="badge bg-success">Tamamlandı</span>',
      4: '<span class="badge bg-danger">Kalıcı Silinen</span>'
    };

    const select = `
      <select class="form-select form-select-sm admin-status" data-id="${t.id}" style="min-width: 160px; padding: 0.25rem 0.5rem; font-size: 0.875rem;">
        <option value="0" ${statusVal===0?'selected':''}>Çöp Kutusunda</option>
        <option value="1" ${statusVal===1?'selected':''}>Başlanmadı</option>
        <option value="2" ${statusVal===2?'selected':''}>Devam Ediyor</option>
        <option value="3" ${statusVal===3?'selected':''}>Tamamlandı</option>
      </select>`;

    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${escapeHtml(t.title)}</td>
      <td>
        <div class="d-flex align-items-center gap-2">${badges[statusVal] || badges[1]}${select}</div>
      </td>
      <td>${t.created_at ?? ''}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Sil</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Status select değişimi (optimistic update)
  tbody.querySelectorAll('select.admin-status').forEach((sel) => {
    sel.addEventListener('change', async () => {
      const id = Number(sel.dataset.id);
      const prevVal = Number(sel.dataset.prev || sel.value);
      const val = Number(sel.value);
      const tr = sel.closest('tr');
      const badgeContainer = tr.querySelector('td:nth-child(3) > div');

      const badges = {
        0: '<span class="badge bg-danger">Çöp Kutusunda</span>',
        1: '<span class="badge bg-primary">Başlanmadı</span>',
        2: '<span class="badge bg-warning text-dark">Devam Ediyor</span>',
        3: '<span class="badge bg-success">Tamamlandı</span>',
        4: '<span class="badge bg-danger">Kalıcı Silinen</span>'
      };

      // Optimistik rozet
      if (badgeContainer) {
        badgeContainer.innerHTML = badges[val] + badgeContainer.innerHTML.substring(badgeContainer.innerHTML.indexOf('<select'));
      }

      // API sonucu başarısız olursa geri dönebilmek için önceki değeri sakla
      sel.dataset.prev = prevVal;

      await adminUpdateStatus(id, val, sel);
    });
  });
  tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      adminDeleteTask(id);
    });
  });
}

// Admin: seçili kullanıcı için yeni görev ekle
async function adminAddTask() {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const title = (newTaskTitle?.value || '').trim();
  if (!title) return showToast('Görev boş olamaz', 'error');

  const fd = new FormData();
  fd.append('title', title);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('../crud.php?action=add', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Görev eklenemedi');
    newTaskTitle.value = '';
    // Seçili kullanıcıda kal; sadece görevleri tazele
    await fetchTasks(selectedUserId);
    showToast('Görev eklendi', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Admin: görevin status'unu güncelle (0/1/2) - error ise tabloyu yenile
async function adminUpdateStatus(taskId, status, selectEl) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', taskId);
  fd.append('status', status);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('../crud.php?action=update_status', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) {
      showToast(data.message || 'Güncelleme başarısız', 'error');
      if (selectEl && selectEl.dataset.prev !== undefined) {
        selectEl.value = selectEl.dataset.prev;
      }
      await fetchTasks(selectedUserId);
    } else {
      showToast('Durum güncellendi', 'success');
      // Sunucudan gelen güncel veriyle senkronize ol
      await fetchTasks(selectedUserId);
    }
  } catch (err) {
    console.error(err);
    showToast('Güncelleme hatası', 'error');
    if (selectEl && selectEl.dataset.prev !== undefined) {
      selectEl.value = selectEl.dataset.prev;
    }
    await fetchTasks(selectedUserId);
  }
}

// Admin: görev sil (çöp kutusuna taşı) ve listeleri güncelle
async function adminDeleteTask(taskId) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', taskId);
  fd.append('status', 4);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('../crud.php?action=update_status', { method: 'POST', body: fd  });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Silme başarısız');
    await fetchTasks(selectedUserId);
    showToast('Görev silinenlere taşındı', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Seçili kullanıcının çöp kutusundaki silinen görevleri getir
async function fetchTrash(userId) {
  if (!userId) userId = selectedUserId;
  if (!userId) return;

  // Artık trashData fetchTasks içinde dolduruluyor
}

// Çöp kutusu tablosunu HTML ile oluştur, geri yükleme/kalıcı silme butonları ekle
function renderTrash() {
  const tbody = document.querySelector('#trashTable tbody');
  tbody.innerHTML = '';
  document.getElementById('trashCount').textContent = trashData.length;

  const emptyBtn = document.getElementById('emptyTrashBtn');
  if (emptyBtn) {
    emptyBtn.style.display = trashData.length > 0 ? 'inline-block' : 'none';
  }

  if (trashData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Çöp kutusu boş</td></tr>';
    return;
  }

  trashData.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${escapeHtml(item.title)}</td>
      <td>${item.deleted_at ?? ''}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-success" data-action="restore" data-id="${item.id}">
            <i class="fa-solid fa-rotate-left"></i> Geri Yükle
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="permanent-delete" data-id="${item.id}">
            <i class="fa-solid fa-trash"></i> Kalıcı Sil
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Event listeners
  tbody.querySelectorAll('button[data-action="restore"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      adminRestoreTask(id);
    });
  });

  tbody.querySelectorAll('button[data-action="permanent-delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      if (confirm('Bu görev kalıcı olarak silinecek. Emin misiniz?')) {
        adminPermanentDeleteTask(id);
      }
    });
  });
}

// Çöp kutusundan görev geri yükle (aktif görev listesine döndür)
async function adminRestoreTask(trashId) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', trashId);
  fd.append('status', 1); // varsayılan: Başlanmadı
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('../crud.php?action=update_status', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Geri yükleme başarısız');
    await fetchTasks(selectedUserId);
    showToast('Görev geri yüklendi', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Çöp kutusundan görev tamamen sil (dosya + veritabanı)
async function adminPermanentDeleteTask(trashId) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', trashId);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('../crud.php?action=permanent_delete', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Kalıcı silme başarısız');
    await fetchTasks(selectedUserId);
    showToast('Görev kalıcı olarak silindi', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// HTML içeriğini güvenli hale getir (XSS saldırılarını önle)
// Özel karakterleri HTML entity'lerine dönüştür
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// URL parametresi oku (tasks.php'de user_id başlangıç seçimi için)
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// Sayfa yüklenince: kullanıcıları getir, buton eventlerini ve tab eventlerini bağla
window.addEventListener('DOMContentLoaded', () => {
  fetchUsers();

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      adminAddTask();
    });
  }

  // Çöp kutusu boşalt: tüm çöpü temizle (onay ile)
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');
  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener('click', async () => {
      if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
      if (!confirm('Tüm silinen görevler kalıcı olarak silinecek. Emin misiniz?')) return;

      try {
        let success = 0;
        for (const item of trashData) {
          const fd = new FormData();
          fd.append('id', item.id);
          fd.append('user_id', selectedUserId);
          const res = await fetch('../crud.php?action=permanent_delete', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.ok) success++;
        }
        await fetchTasks(selectedUserId);
        showToast(`Silinen görevler temizlendi (${success}/${trashData.length})`, 'success');
      } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
      }
    });
  }

  // Tab değişiminde ilgili veriyi yükle
  const trashTab = document.getElementById('trash-tab');
  if (trashTab) {
    trashTab.addEventListener('shown.bs.tab', () => {
      if (selectedUserId) fetchTasks(selectedUserId);
    });
  }
});
