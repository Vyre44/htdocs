// tasks.js - Task CRUD işlemleri

// HTML elemanlara erişim
const taskList = document.getElementById("taskList");
const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("titleInput");

// HTML karakterleri escape et (XSS koruması)
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// Bir task için list item HTML'i oluştur - görev başlığı, resim, durum butonu
// Tamamlananlar sürüklenemez (draggable false olur)
function renderTask(t) {
  const li = document.createElement("li");
  li.dataset.id = t.id;
  li.draggable = (t.is_done == 0);

  const imgHtml = (t.image_path && t.image_path.trim() !== "")
    ? `<img src="${escapeHtml(t.image_path)}" class="thumb" alt="">`
    : "";

  const isDone = Number(t.is_done) === 1;
  const statusBtn = `<button class="status-btn ${isDone ? 'btn-done' : 'btn-open'}" data-id="${t.id}" data-done="${isDone ? 1 : 0}" type="button">${isDone ? 'Tamamlandı' : 'Tamamlanmamış'}</button>`;
  li.innerHTML = `
    <div class="left">
      ${statusBtn}
      <span class="task-title ${isDone ? "task-done" : ""}">${escapeHtml(t.title)}</span>
      ${imgHtml}
    </div>

    <div class="actions">
      <label class="img-btn" title="JPEG yükle">
        <input type="file" class="img-input" data-id="${t.id}" accept="image/jpeg">
        🖼️
      </label>
    </div>
  `;
  return li;
}

// Tüm taskları API'den getir ve sayfada göster
// Sürükleme-bırakma özelliğini de etkinleştir
async function loadTasks() {
  const res = await fetch("crud.php?action=list");
  const data = await res.json();

  if (!data.ok) {
    showToast(data.message || "Liste yuklenemedi", "error");
    return;
  }

  taskList.innerHTML = "";
  data.tasks.forEach(t => taskList.appendChild(renderTask(t)));

  // Sürükleme-bırakma işlevini etkinleştir
  enableDragAndDrop();
}

// Yeni task ekle: form gönderildiğinde API'ye istek yap ve listeyi yenile
// Boş görev veya whitespace-only görevler gönderilmez
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return showToast("Görev boş olamaz", "error");

  const fd = new FormData();
  fd.append("title", title);

  const res = await fetch("crud.php?action=add", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) return showToast(data.message || "Ekleme basarisiz", "error");

  titleInput.value = "";
  await loadTasks();
});

// Durum butonuna basarak tamamla/aç işlemi: optimistic update + sunucu onayı
// UI hemen güncellenecek, sunucu hatası varsa geri alınacak
// Tamamlanan görevler sonda, tamamlanmayan görevler üstte konumlandırılır
taskList.addEventListener("click", async (e) => {
  const statusBtn = e.target.closest(".status-btn");
  if (!statusBtn) return;
  const li = statusBtn.closest("li");
  if (!li) return;

  const titleEl = li.querySelector(".task-title");
  const currentlyDone = statusBtn.dataset.done === '1';
  const willBeDone = currentlyDone ? 0 : 1;

  // UI ön güncelleme (optimistic update) - sunucuyu beklemeden doğru göster
  titleEl.classList.toggle("task-done", willBeDone === 1);
  li.draggable = (willBeDone === 0);
  statusBtn.dataset.done = String(willBeDone);
  statusBtn.textContent = willBeDone === 1 ? "Tamamlandı" : "Tamamlanmamış";
  statusBtn.classList.toggle('btn-done', willBeDone === 1);
  statusBtn.classList.toggle('btn-open', willBeDone === 0);

  const fd = new FormData();
  fd.append("id", li.dataset.id);
  fd.append("is_done", willBeDone);

  const res = await fetch("crud.php?action=toggle", { method: "POST", body: fd });
  const data = await res.json();

  if (!data.ok) {
    // Geri al
    titleEl.classList.toggle("task-done", currentlyDone);
    li.draggable = (currentlyDone ? false : true);
    statusBtn.dataset.done = String(currentlyDone ? 1 : 0);
    statusBtn.textContent = currentlyDone ? "Tamamlandı" : "Tamamlanmamış";
    statusBtn.classList.toggle('btn-done', currentlyDone);
    statusBtn.classList.toggle('btn-open', !currentlyDone);
    showToast(data.message || "Güncelleme basarisiz", "error");
    return;
  }

  // Tamamlananları aşağıya al, tamamlanmamışları üstte tut
  // Sıralama kuralı: Tamamlanmış görevler en sonda, tamamlanmamış görevler başında
  if (willBeDone === 1) {
    // Tamamlandı: en sona taşı
    taskList.appendChild(li);
  } else {
    // Tamamlanmamış: ilk tamamlanmış görevin öncesine ekle (tamamlanmamışların en altına)
    const firstDone = [...taskList.children].find(child => {
      return child.querySelector(".task-title").classList.contains("task-done");
    });
    if (firstDone) {
      taskList.insertBefore(li, firstDone);
    } else {
      // Hiç tamamlanmış görev yoksa, en sona ekle
      taskList.appendChild(li);
    }
  }
  enableDragAndDrop();
});
