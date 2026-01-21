// admin.js - Admin paneli işlemleri

let usersData = [];
let selectedUserId = null;
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
  await fetchTasks(userId);
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
});
