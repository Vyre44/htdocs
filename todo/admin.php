<?php
require_once 'auth.php';
if ((int)$CURRENT_USER_ROLE !== 2) {
  header('Location: index.php');
  exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Paneli</title>
  <!-- Bootstrap & Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/style.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <!-- Admin Panel CSS -->
  <link rel="stylesheet" href="css/admin.css?v=<?php echo time(); ?>">
</head>
<body class="sb-nav-fixed bg-light">
  <nav class="navbar navbar-expand navbar-dark bg-dark">
    <a class="navbar-brand ps-3" href="#">Admin Paneli</a>
    <div class="ms-auto me-3 d-flex align-items-center gap-3 text-white">
      <span><i class="fa-regular fa-user"></i> <?php echo htmlspecialchars($CURRENT_USERNAME); ?></span>
      <button id="logoutBtn" class="btn btn-sm btn-outline-danger"><i class="fa-solid fa-right-from-bracket"></i> Çıkış</button>
    </div>
  </nav>

  <main class="container-fluid py-4">
    <div class="row g-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0">Kullanıcılar</h5>
              <small class="text-muted">Role: 1=Kullanıcı, 2=Admin</small>
            </div>
            <span class="badge bg-primary" id="userCount">0 kullanıcı</span>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped" id="usersTable">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Kullanıcı Adı</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Görev Sayısı</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs" id="adminTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="tasks-tab" data-bs-toggle="tab" data-bs-target="#tasks" type="button" role="tab">
                  <i class="fa-solid fa-list-check"></i> Görevler
                  <span class="badge bg-secondary ms-1" id="taskCount">0</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="trash-tab" data-bs-toggle="tab" data-bs-target="#trash" type="button" role="tab">
                  <i class="fa-solid fa-trash"></i> Çöp Kutusu
                  <span class="badge bg-danger ms-1" id="trashCount">0</span>
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <div class="tab-content" id="adminTabContent">
              <!-- Görevler Sekmesi -->
              <div class="tab-pane fade show active" id="tasks" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0" id="tasksTitle">Görevler</h5>
                </div>
                <div class="d-flex gap-2 mb-3">
                  <input type="text" id="newTaskTitle" class="form-control" placeholder="Yeni görev yaz..." />
                  <button id="addTaskBtn" class="btn btn-success">Ekle</button>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover" id="tasksTable">
                    <thead class="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Başlık</th>
                        <th>Durum</th>
                        <th>Oluşturulma</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>

              <!-- Çöp Kutusu Sekmesi -->
              <div class="tab-pane fade" id="trash" role="tabpanel">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0" id="trashTitle">Çöp Kutusu</h5>
                  <button id="emptyTrashBtn" class="btn btn-danger btn-sm" style="display: none;">
                    <i class="fa-solid fa-trash-can"></i> Tümünü Temizle
                  </button>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover" id="trashTable">
                    <thead class="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Başlık</th>
                        <th>Silinme Tarihi</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Scriptler -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
  <script src="js/utils.js?v=<?php echo time(); ?>"></script>
  <script src="js/logout.js?v=<?php echo time(); ?>"></script>
  <script src="js/admin.js?v=<?php echo time(); ?>"></script>
</body>
</html>
