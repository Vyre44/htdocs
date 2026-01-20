<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Mini To-Do</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="box">
    <div class="header">
      <h2>Mini To-Do</h2>
      <div class="header-actions">
        <button id="clearDoneBtn" type="button">Seçili (✓) Sil</button>
        <button id="clearAllBtn" type="button">Hepsini Sil</button>
        <button id="toggleTrashBtn" type="button">Çöp Kutusu</button>
      </div>
    </div>

    <form id="addForm" class="add-form">
      <input id="titleInput" type="text" name="title" placeholder="Yeni görev yaz..." maxlength="255">
      <button type="submit">Ekle</button>
    </form>

    <hr>  

    <ul id="taskList"></ul>
  </div>

  <div class="box" id="trashBox" style="display:none;">
    <div class="header">
      <h3>Çöp Kutusu</h3>
      <div class="header-actions">
        <button id="emptyTrashBtn" type="button">Çöpü Boşalt</button>
      </div>
    </div>
    <ul id="trashList"></ul>
  </div>

  <!-- JavaScript modüllerini yükle -->
  <script src="js/utils.js"></script>
  <script src="js/tasks.js"></script>
  <script src="js/dragdrop.js"></script>
  <script src="js/upload.js"></script>
  <script src="js/bulk.js"></script>
  <script src="js/trash.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
