<?php
require_once 'admin_auth.php';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Paneli</title>
  <!-- Bootstrap & Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <!-- Admin CSS -->
  <link rel="stylesheet" href="../css/admin.css?v=<?php echo time(); ?>">
</head>
<body class="bg-light">
  <!-- Navbar -->
  <?php require_once 'layout/navbar.php'; ?>
  
  <!-- Sidebar -->
  <?php require_once 'layout/sidebar.php'; ?>

  <!-- Ana İçerik -->
  <main class="main-content">
    <div class="container-fluid">
      <div class="row g-4">
        <div class="col-12">
          <div class="card welcome-card shadow-lg">
            <div class="card-body text-center py-5">
              <h1 class="display-4 mb-3">
                <i class="fa-solid fa-chart-line"></i> Hoş Geldiniz
              </h1>
              <p class="lead mb-4">
                Admin Paneline Hoş Geldiniz, <?php echo htmlspecialchars($CURRENT_USERNAME); ?>!
              </p>
              <p class="text-white-50 mb-4">
                Sol menüdeki seçeneklerden kullanıcıları ve görevleri yönetebilirsiniz.
              </p>
              <div class="d-flex gap-3 justify-content-center">
                <a href="users.php" class="btn btn-light btn-lg">
                  <i class="fa-solid fa-users"></i> Kullanıcıları Yönet
                </a>
                <a href="tasks.php" class="btn btn-light btn-lg">
                  <i class="fa-solid fa-list-check"></i> Görevleri Yönet
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Scriptler -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../js/utils.js?v=<?php echo time(); ?>"></script>
  <script src="../js/logout.js?v=<?php echo time(); ?>"></script>
</body>
</html>
