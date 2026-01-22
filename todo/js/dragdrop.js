// dragdrop.js - Kanban sütunları arası sürükleme-bırakma

let draggedLi = null;
let isProcessing = false; // Race condition önleme

// Sürükleme-bırakma özelliğini etkinleştir
function enableDragAndDrop() {
  const allLists = document.querySelectorAll(".task-list");
  const allItems = document.querySelectorAll(".task-list li");

  allItems.forEach(li => {
    // Sürükleme başladı
    li.addEventListener("dragstart", () => {
      draggedLi = li;
      li.style.opacity = "0.5";
      isProcessing = false;
    });

    // Sürükleme bitti
    li.addEventListener("dragend", async () => {
      li.style.opacity = "1";

      // Duplicate işlemi engelle
      if (isProcessing) {
        draggedLi = null;
        return;
      }

      // Bırakıldığı sütunu tespit et
      const listEl = li.parentElement;
      const column = listEl ? listEl.closest('.kanban-column') : null;
      if (!column) { draggedLi = null; return; }

      const newStatus = column.dataset.status;
      const oldStatus = li.dataset.status || '1';

      // Çöp kutusundan başlayan sürüklemeleri ignore et (trash.js handle eder)
      if (oldStatus === '0' || oldStatus === '4') {
        draggedLi = null;
        return;
      }

      // Çöp kutusuna bırakıldıysa delete API (status=0)
      if (newStatus === '0') {
        isProcessing = true;
        const id = li.dataset.id;
        const fd = new FormData();
        fd.append('id', id);

        try {
          const res = await fetch('crud.php?action=delete', { method: 'POST', body: fd });
          const data = await res.json();
          if (!data.ok) {
            showToast(data.message || 'Silme başarısız', 'error');
            await loadTasks();
          } else {
            showToast('Görev çöpe taşındı', 'success');
            li.remove();
            updateCounts();
            if (typeof loadTrash === 'function') loadTrash();
          }
        } catch (err) {
          showToast('Silme hatası', 'error');
          await loadTasks();
        }
        isProcessing = false;
        draggedLi = null;
        return;
      }

      // Normal status değişimi (1/2/3)
      const newStatusInt = parseInt(newStatus);
      const oldStatusInt = parseInt(oldStatus);

      if (newStatusInt !== oldStatusInt) {
        isProcessing = true;
        li.dataset.status = newStatusInt;

        const fd = new FormData();
        fd.append('id', li.dataset.id);
        fd.append('status', newStatusInt);

        try {
          const res = await fetch('crud.php?action=update_status', { method: 'POST', body: fd });
          const data = await res.json();
          if (!data.ok) {
            showToast(data.message || 'Status güncellenemedi', 'error');
            await loadTasks();
          } else {
            updateCounts();
          }
        } catch (err) {
          showToast('Status güncellenemedi', 'error');
          await loadTasks();
        }
        isProcessing = false;
      }

      draggedLi = null;
    });

    // Üzerine sürükleniyor
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedLi || draggedLi === li) return;

      const rect = li.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > (rect.height / 2);

      if (isAfter) li.after(draggedLi);
      else li.before(draggedLi);
    });
  });

  // Sütunlara bırakma (boş sütuna bırakılınca elemanı ekle)
  allLists.forEach(list => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    list.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedLi) return;

      // Boş sütuna bırakılırsa
      if (e.target.classList.contains("task-list") && e.target.children.length === 0) {
        e.target.appendChild(draggedLi);
      }

    });
  });
}

