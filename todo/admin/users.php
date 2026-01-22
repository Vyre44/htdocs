<?php
require_once 'admin_auth.php';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kullanıcılar - Admin Paneli</title>
  <!-- Bootstrap & Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/style.min.css" rel="stylesheet" />
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
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">
                  <i class="fa-solid fa-users"></i> Kullanıcılar
                </h5>
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
      </div>
    </div>
  </main>

  <!-- Scriptler -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
  <script src="../js/utils.js?v=<?php echo time(); ?>"></script>
  <script src="../js/logout.js?v=<?php echo time(); ?>"></script>
  
  <script>
    // Kullanıcıları yükle
    async function loadUsers() {
      try {
        const response = await fetch('../crud.php?action=admin_users');
        const data = await response.json();

        if (!data.ok) {
          showToast(data.message || 'Kullanıcılar yüklenemedi', 'error');
          return;
        }

        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        document.getElementById('userCount').textContent = `${data.users.length} kullanıcı`;

        data.users.forEach((user) => {
          const tr = document.createElement('tr');
          const roleText = user.role === 1 ? 'Kullanıcı' : 'Admin';
          tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 1 ? 'bg-info' : 'bg-danger'}">${roleText}</span></td>
            <td>${user.task_count}</td>
            <td>
              <div class="d-flex gap-2">
                <a href="tasks.php?user_id=${user.id}" class="btn btn-sm btn-outline-info">
                  <i class="fa-solid fa-tasks"></i> Görevleri Gör
                </a>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    loadUsers();
  </script>
</body>
</html>
