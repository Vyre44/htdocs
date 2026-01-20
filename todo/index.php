<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Mini To-Do</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="box">
    <h2>Mini To-Do</h2>

    <form id="addForm" class="add-form">
      <input id="titleInput" type="text" name="title" placeholder="Yeni görev yaz..." maxlength="255">
      <button type="submit">Ekle</button>
    </form>

    <hr>  

    <ul id="taskList"></ul>
  </div>

  <!-- JavaScript modüllerini yükle -->
  <script src="js/utils.js"></script>
  <script src="js/tasks.js"></script>
  <script src="js/dragdrop.js"></script>
  <script src="js/upload.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
