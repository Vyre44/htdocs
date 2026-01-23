// trash.js - Çöp kutusu işlemleri (Kanban trash kolonu)
// Silinen görevleri trash kolonunda göster, geri yükle veya kalıcı sil
const trashList = document.getElementById('taskList-0');
const countTrash = document.getElementById('count-0');

// Çöp kutusundan silinen tüm görevleri yükle ve trash kolonuna render et
async function loadTrash(){
  if(!trashList) return;
  const res = await fetch('crud.php?action=list');
  const data = await res.json();
  if(!data.ok){
    showToast(data.message || 'Çöp kutusu yüklenemedi', 'error');
    return;
  }
  trashList.innerHTML = '';
  // Sadece status=0 olanları al
  const trashTasks = data.tasks.filter(t => t.status === 0);
  trashTasks.forEach(item => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = item.id;
    li.dataset.status = '0';
    const img = item.image_path ? `<img src="${escapeHtml(item.image_path)}" class="thumb" alt="">` : '';
    li.innerHTML = `
      <div class="left">
        <span class="task-title">${escapeHtml(item.title)}</span>
        ${img}
      </div>
      <div class="actions">
        <button class="trash-delete-btn" data-id="${item.id}" title="Kalıcı Sil">🗑️</button>
      </div>
    `;
    trashList.appendChild(li);
  });
  
  // Trash kolonundaki görev sayısını güncelle
  if(countTrash) countTrash.textContent = trashTasks.length;
  
  // Drag-drop özelliklerini yeniden etkinleştir
  if(typeof enableDragAndDrop === 'function') enableDragAndDrop();
}

// Çöpten görev geri yükle: trash_restore API'sini çağır
// Çöp kutusundan bir görevi başka kolona sürükleyince restore edilir
let dragStartStatus = null;

document.addEventListener('dragstart', (e) => {
  const li = e.target;
  if (li.dataset && li.dataset.status) {
    dragStartStatus = li.dataset.status;
  }
});

document.addEventListener('dragend', async (e) => {
  const li = e.target;
  
  // Sadece trash kolonundan başlayan sürüklemeleri işle
  if (dragStartStatus !== '0') {
    dragStartStatus = null;
    return;
  }
  
  dragStartStatus = null;
  
  // Eğer trash kolonundan başka bir kolona sürüklendiyse
  const newColumn = li.closest('.kanban-column');
  if (!newColumn || newColumn.dataset.status === '0') return;
  
  // Status güncelle (0'dan başka bir duruma geçiş)
  const id = li.dataset.id;
  const newStatus = newColumn.dataset.status;
  const fd = new FormData();
  fd.append('id', id);
  fd.append('status', newStatus);
  
  const res = await fetch('crud.php?action=update_status', {method:'POST', body: fd});
  const data = await res.json();
  
  if(!data.ok){
    showToast(data.message || 'Status güncellenemedi', 'error');
  } else {
    showToast('Görev geri alındı', 'success');
  }
  
  await loadTasks();
  await loadTrash();
});

// Çöp kutusunu tamamen boşalt butonu
const emptyTrashBtn = document.getElementById('emptyTrashBtn');
if(emptyTrashBtn){
  emptyTrashBtn.addEventListener('click', ()=>{
    const trashCount = trashList.children.length;
    if(trashCount === 0) {
      showToast('Çöp kutusu zaten boş', 'info');
      return;
    }
    showEmptyTrashModal(trashCount);
  });
}

// Çöp kutusu boşaltma modal'ı
function showEmptyTrashModal(count) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Çöp Kutusunu Boşalt</h3>
      <p>${count} görev kalıcı olarak silinecek. Onaylıyor musunuz?</p>
      <div class="modal-buttons">
        <button class="btn-confirm" id="confirmEmptyTrash">Evet, Boşalt</button>
        <button class="btn-cancel" id="cancelEmptyTrash">İptal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Event listeners
  const confirmBtn = document.getElementById('confirmEmptyTrash');
  const cancelBtn = document.getElementById('cancelEmptyTrash');
  
  confirmBtn.addEventListener('click', async () => {
    modal.remove();
    // Tüm status=0 görevleri kalıcı silinenlere (status=4) taşı
    const allTrashItems = Array.from(trashList.children);
    let successCount = 0;
    
    for(const li of allTrashItems) {
      const fd = new FormData();
      fd.append('id', li.dataset.id);
      const res = await fetch('crud.php?action=permanent_delete', {method:'POST', body: fd});
      const data = await res.json();
      if(data.ok) successCount++;
    }
    
    if(successCount === allTrashItems.length) {
      showToast('Çöp kutusu boşaltıldı', 'success');
    } else {
      showToast(`${successCount}/${allTrashItems.length} görev taşındı`, 'warning');
    }
    await loadTrash();
  });
  
  cancelBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Çöp kutusundan kalıcı silme butonu
document.addEventListener('click', async (e)=>{
  if(!e.target.classList.contains('trash-delete-btn')) return;
  const id = e.target.dataset.id;
  
  // Modal onay göster
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Kalıcı Sil</h3>
      <p>Bu görev kalıcı silinenlere taşınacak. Onaylıyor musunuz?</p>
      <div class="modal-buttons">
        <button class="btn-confirm" id="confirmTrashDelete">Evet, Taşı</button>
        <button class="btn-cancel" id="cancelTrashDelete">İptal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confirmBtn = document.getElementById('confirmTrashDelete');
  const cancelBtn = document.getElementById('cancelTrashDelete');
  
  confirmBtn.addEventListener('click', async () => {
    modal.remove();
    
    const fd = new FormData();
    fd.append('id', id);
    const res = await fetch('crud.php?action=permanent_delete', {method:'POST', body: fd});
    const data = await res.json();
    if(!data.ok){
      showToast(data.message || 'Taşınamadı', 'error');
      return;
    }
    showToast('Görev kalıcı silinenlere taşındı', 'success');
    await loadTrash();
  });
  
  cancelBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
});

// Sayfa yüklendiğinde çöp kutusunu getir
document.addEventListener("DOMContentLoaded", () => {
  loadTrash();
});
