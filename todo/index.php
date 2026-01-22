<?php require_once 'auth.php'; ?>
<?php if ((int)$CURRENT_USER_ROLE === 2) { header('Location: admin/index.php'); exit; } ?> <!--Admin kontrolü -->
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Mini To-Do</title>
  <link rel="stylesheet" href="css/style.css?v=<?php echo time(); ?>">
</head>
<body>
  <div class="box">
    <div class="header">
      <h2>Mini To-Do - Hoş geldin, <?php echo htmlspecialchars($CURRENT_USERNAME); ?></h2>
      <div class="header-actions">
        <button id="logoutBtn" type="button" style="background:#e74c3c;color:white;">Çıkış</button>
      </div>
    </div>

    <form id="addForm" class="add-form">
      <input id="titleInput" type="text" name="title" placeholder="Yeni görev yaz..." maxlength="255">
      <button type="submit">Ekle</button>
    </form>

    <hr>  

    <!-- 3 Sütunlu Kanban Board + Çöp Kutusu -->
    <div class="kanban-board">
      <div class="kanban-column" data-status="1">
        <div class="column-header">
          <h3>📝 Başlanmadı</h3>
          <span class="task-count" id="count-1">0</span>
        </div>
        <ul class="task-list" id="taskList-1"></ul>
      </div>

  <div class="kanban-column" data-status="2">
        <div class="column-header">
          <h3>⚡ Devam Ediyor</h3>
          <span class="task-count" id="count-2">0</span>
        </div>
        <ul class="task-list" id="taskList-2"></ul>
      </div>

  <div class="kanban-column" data-status="3">
        <div class="column-header">
          <h3>✅ Tamamlandı</h3>
          <span class="task-count" id="count-3">0</span>
        </div>
        <ul class="task-list" id="taskList-3"></ul>
      </div>

  <div class="kanban-column trash-column" data-status="0">
        <div class="column-header">
          <h3>🗑️ Çöp Kutusu</h3>
          <div style="display:flex;align-items:center;gap:8px;">
            <button id="emptyTrashBtn" type="button" style="font-size:12px;padding:4px 8px;background:#f44336;color:white;border:none;border-radius:4px;cursor:pointer;" title="Çöpü Boşalt">🗑️</button>
            <span class="task-count" id="count-0">0</span>
          </div>
        </div>
        <ul class="task-list" id="taskList-0"></ul>
      </div>
    </div>
  </div>

  <!-- JavaScript modüllerini yükle -->
  <script src="js/utils.js"></script>
  <script src="js/tasks.js"></script>
  <script src="js/dragdrop.js"></script>
  <script src="js/upload.js"></script>
  <script src="js/bulk.js"></script>
  <script src="js/trash.js"></script>
  <script src="js/logout.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
