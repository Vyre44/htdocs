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
  <!-- Bootstrap & Icons (StartBootstrap SB Admin temeli) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/style.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <style>
    /* Toast stilleri (uygulama geneliyle uyumlu) */
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 14px 20px;
      border-radius: 6px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      z-index: 9999;
      max-width: 320px;
      word-wrap: break-word;
      color: #fff;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
    .toast-success { background-color: #4caf50; }
    .toast-error { background-color: #f44336; }
    .role-badge { font-size: 12px; }
    .status-check { width: 18px; height: 18px; cursor: default; }
    .status-check.check-done { border-color: #4caf50; background-color: #4caf50; }
    .status-check.check-open { border-color: #f44336; background-color: #fff; }

    /* Tablo görünüm düzeltmesi */
    #tasksTable tbody tr { vertical-align: middle; }
    #tasksTable td { padding: 12px 8px; }

    /* Logout modal (style.css yüklenmediği için burada tanımlandı) */
    .modal {
      display: none;
      position: fixed;
      z-index: 1050;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      animation: fadeIn 0.3s;
    }
    .modal.show { display: flex; align-items: center; justify-content: center; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-content {
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 400px;
      text-align: center;
      animation: slideUp 0.3s;
    }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-buttons { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
    .modal-buttons button { padding: 10px 25px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    .btn-confirm { background-color: #f44336; color: white; }
    .btn-confirm:hover { background-color: #d32f2f; box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4); }
    .btn-cancel { background-color: #e0e0e0; color: #333; }
    .btn-cancel:hover { background-color: #bdbdbd; }
  </style>
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
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0" id="tasksTitle">Görevler</h5>
            <span class="badge bg-secondary" id="taskCount">0 görev</span>
          </div>
          <div class="card-body">
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
