// dragdrop.js - Sürükleme-bırakma işlemleri

// Genel değişken: şu anda sürüklenen list item
let draggedLi = null;

// Sürükleme-bırakma özelliğini etkinleştir
// Tamamlanan görevler (task-done sınıfı olanlar) sürüklenemez
function enableDragAndDrop() {
  const items = taskList.querySelectorAll("li");

  items.forEach(li => {
    const done = li.querySelector(".task-title")?.classList.contains("task-done");
    if (done) return; // Tamamlananlar sürüklenemez

    // Sürükleme başladı
    li.addEventListener("dragstart", () => {
      draggedLi = li;
      li.style.opacity = "0.5";
    });

    // Sürükleme bitti
    li.addEventListener("dragend", () => {
      li.style.opacity = "1";
      draggedLi = null;
      saveOrder();
    });

    // Üzerine sürükleniyor
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedLi || draggedLi === li) return;

      // Tamamlananlar hedef olamasın
      const targetDone = li.querySelector(".task-title")?.classList.contains("task-done");
      if (targetDone) return;

      const rect = li.getBoundingClientRect();
      const isAfter = (e.clientY - rect.top) > (rect.height / 2);

      if (isAfter) li.after(draggedLi);
      else li.before(draggedLi);
    });
  });
}

/* Yeni sırayı veritabanına kaydet
   Tamamlanmamış görevlerin yalnız sırası kaydedilir
   Tamamlananlar her zaman sonda olur */
async function saveOrder() {
  const ids = [...taskList.querySelectorAll("li")]
    .filter(li => !li.querySelector(".task-title")?.classList.contains("task-done"))
    .map(li => li.dataset.id);

  if (ids.length === 0) return;

  const fd = new FormData();
  fd.append("order", ids.join(","));

  const res = await fetch("crud.php?action=reorder", { method: "POST", body: fd });
  const data = await res.json();
  if (!data.ok) showToast(data.message || "Sıralama kaydedilemedi", "error");
}
