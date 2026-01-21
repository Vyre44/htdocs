// admin.js - Admin paneli işlemleri

let usersData = [];
let selectedUserId = null;
let trashData = [];
const addTaskBtn = document.getElementById('addTaskBtn');
const newTaskTitle = document.getElementById('newTaskTitle');

function roleBadge(role) {
  const r = Number(role) || 1;
  const label = r >= 2 ? 'Admin' : 'Kullanıcı';
  const cls = r >= 2 ? 'bg-danger' : 'bg-success';
  return `<span class="badge ${cls} role-badge">${label}</span>`;
}

// Kullanıcıları getir
async function fetchUsers() {
  try {
    const res = await fetch('crud.php?action=admin_users');
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Kullanıcılar alınamadı');
    usersData = data.users || [];
    renderUsers();
    if (usersData.length > 0) {
      selectUser(usersData[0].id, usersData[0].username);
    }
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

function renderUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  document.getElementById('userCount').textContent = `${usersData.length} kullanıcı`;

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

async function selectUser(userId, username) {
  selectedUserId = userId;
  document.getElementById('tasksTitle').textContent = `Görevler - ${username}`;
  document.getElementById('trashTitle').textContent = `Çöp Kutusu - ${username}`;
  await fetchTasks(userId);
  await fetchTrash(userId);
}

// Seçili kullanıcının görevlerini getir
async function fetchTasks(userId) {
  try {
    const fd = new FormData();
    fd.append('user_id', userId);
    const res = await fetch('crud.php?action=admin_user_tasks', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Görevler alınamadı');
    renderTasks(data.tasks || []);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

function renderTasks(tasks) {
  const tbody = document.querySelector('#tasksTable tbody');
  tbody.innerHTML = '';
  document.getElementById('taskCount').textContent = `${tasks.length} görev`;

  tasks.forEach((t) => {
    const tr = document.createElement('tr');
    const isDone = Number(t.is_done) === 1;
    const status = isDone
      ? '<span class="badge bg-success">Tamamlandı</span>'
      : '<span class="badge bg-danger">Tamamlanmadı</span>';
    const checkbox = `<input type="checkbox" class="form-check-input status-check ${isDone ? 'check-done' : 'check-open'}" disabled ${isDone ? 'checked' : ''}>`;
    tr.innerHTML = `
      <td>${t.id}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          ${checkbox}<span class="${isDone ? 'text-decoration-line-through text-muted' : ''}">${escapeHtml(t.title)}</span>
        </div>
      </td>
      <td>${status}</td>
      <td>${t.created_at ?? ''}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm ${isDone ? 'btn-outline-secondary' : 'btn-outline-success'}" data-action="toggle" data-id="${t.id}" data-done="${t.is_done}">
            ${isDone ? 'Aç' : 'Tamamla'}
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Sil</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Toggle / delete eventleri
  tbody.querySelectorAll('button[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const current = Number(btn.dataset.done) === 1 ? 1 : 0;
      adminToggleTask(id, current === 1 ? 0 : 1);
    });
  });
  tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      adminDeleteTask(id);
    });
  });
}

// Admin: yeni görev ekle
async function adminAddTask() {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const title = (newTaskTitle?.value || '').trim();
  if (!title) return showToast('Görev boş olamaz', 'error');

  const fd = new FormData();
  fd.append('title', title);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('crud.php?action=add', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Görev eklenemedi');
    newTaskTitle.value = '';
    await fetchTasks(selectedUserId);
    await fetchUsers();
    showToast('Görev eklendi', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Admin: görev durum değiştir
async function adminToggleTask(taskId, isDone) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', taskId);
  fd.append('is_done', isDone);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('crud.php?action=toggle', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Güncelleme başarısız');
    await fetchTasks(selectedUserId);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Admin: görev sil
async function adminDeleteTask(taskId) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', taskId);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('crud.php?action=delete', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Silme başarısız');
    await fetchTasks(selectedUserId);
    await fetchTrash(selectedUserId);
    await fetchUsers();
    showToast('Görev çöp kutusuna taşındı', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Çöp kutusunu getir
async function fetchTrash(userId) {
  if (!userId) userId = selectedUserId;
  if (!userId) return;

  try {
    const fd = new FormData();
    fd.append('user_id', userId);
    const res = await fetch('crud.php?action=trash_list', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Çöp kutusu alınamadı');
    trashData = data.items || [];
    renderTrash();
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

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

// Çöpten geri yükle
async function adminRestoreTask(trashId) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', trashId);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('crud.php?action=trash_restore', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Geri yükleme başarısız');
    await fetchTasks(selectedUserId);
    await fetchTrash(selectedUserId);
    await fetchUsers();
    showToast('Görev geri yüklendi', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Çöpten kalıcı sil
async function adminPermanentDeleteTask(trashId) {
  if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
  const fd = new FormData();
  fd.append('id', trashId);
  fd.append('user_id', selectedUserId);

  try {
    const res = await fetch('crud.php?action=trash_delete', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || 'Kalıcı silme başarısız');
    await fetchTrash(selectedUserId);
    showToast('Görev kalıcı olarak silindi', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

// Basit XSS koruması
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Sayfa yüklenince başlat
window.addEventListener('DOMContentLoaded', () => {
  fetchUsers();

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      adminAddTask();
    });
  }

  // Çöp kutusu boşalt butonu
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');
  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener('click', async () => {
      if (!selectedUserId) return showToast('Kullanıcı seçili değil', 'error');
      if (!confirm('Tüm çöp kutusu temizlenecek. Emin misiniz?')) return;

      try {
        const fd = new FormData();
        fd.append('user_id', selectedUserId);
        const res = await fetch('crud.php?action=trash_empty', { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.ok) throw new Error(data.message || 'Çöp kutusu boşaltılamadı');
        await fetchTrash(selectedUserId);
        showToast('Çöp kutusu boşaltıldı', 'success');
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
      if (selectedUserId) fetchTrash(selectedUserId);
    });
  }
});
