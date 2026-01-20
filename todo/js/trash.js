// trash.js - Çöp kutusu işlemleri
const trashBox = document.getElementById('trashBox');
const trashList = document.getElementById('trashList');
const toggleTrashBtn = document.getElementById('toggleTrashBtn');
const emptyTrashBtn = document.getElementById('emptyTrashBtn');

async function loadTrash(){
  if(!trashList) return;
  const res = await fetch('crud.php?action=trash_list');
  const data = await res.json();
  if(!data.ok){
    showToast(data.message || 'Çöp kutusu yüklenemedi', 'error');
    return;
  }
  trashList.innerHTML = '';
  data.items.forEach(item => {
    const li = document.createElement('li');
    li.dataset.id = item.id;
    const img = item.image_path ? `<img src="${escapeHtml(item.image_path)}" class="thumb" alt="">` : '';
    li.innerHTML = `
      <div class="left">
        <span class="task-title">${escapeHtml(item.title)}</span>
        ${img}
      </div>
      <div class="actions">
        <button class="restore-btn" data-id="${item.id}">Geri Al</button>
        <button class="trash-delete-btn" data-id="${item.id}">Sil</button>
      </div>
    `;
    trashList.appendChild(li);
  });
}

if(toggleTrashBtn){
  toggleTrashBtn.addEventListener('click', async ()=>{
    const visible = trashBox.style.display !== 'none';
    trashBox.style.display = visible ? 'none' : 'block';
    if(!visible) await loadTrash();
  });
}

if(emptyTrashBtn){
  emptyTrashBtn.addEventListener('click', async ()=>{
    if(!confirm('Çöp tamamen boşaltılsın mı?')) return;
    const res = await fetch('crud.php?action=trash_empty', {method:'POST'});
    const data = await res.json();
    if(!data.ok){
      showToast(data.message || 'Boşaltılamadı', 'error');
      return;
    }
    showToast('Çöp kutusu boşaltıldı', 'success');
    trashList.innerHTML='';
  });
}

// Restore handler
document.addEventListener('click', async (e)=>{
  if(!e.target.classList.contains('restore-btn')) return;
  const id = e.target.dataset.id;
  const fd = new FormData();
  fd.append('id', id);
  const res = await fetch('crud.php?action=trash_restore', {method:'POST', body: fd});
  const data = await res.json();
  if(!data.ok){
    showToast(data.message || 'Geri alma başarısız', 'error');
    return;
  }
  showToast('Görev geri alındı', 'success');
  await loadTasks();
  await loadTrash();
});

// Trash delete handler
document.addEventListener('click', async (e)=>{
  if(!e.target.classList.contains('trash-delete-btn')) return;
  const id = e.target.dataset.id;
  if(!confirm('Kalıcı olarak silinsin mi?')) return;
  const fd = new FormData();
  fd.append('id', id);
  const res = await fetch('crud.php?action=trash_delete', {method:'POST', body: fd});
  const data = await res.json();
  if(!data.ok){
    showToast(data.message || 'Silinemedi', 'error');
    return;
  }
  showToast('Kalıcı olarak silindi', 'success');
  await loadTrash();
});
