<?php
// sidebar.php - Admin paneli sol menü
$current_page = basename($_SERVER['PHP_SELF']);
?>
<nav class="sidebar navbar navbar-dark bg-dark flex-column position-fixed start-0 top-0">
  <div style="width: 100%; padding: 5px 0;">
    <ul class="nav flex-column w-100">
      <li class="nav-item mb-2">
        <a class="nav-link <?php echo ($current_page === 'index.php') ? 'active' : ''; ?>" href="index.php">
          <i class="fa-solid fa-home"></i>
          <span class="label">Dashboard</span>
        </a>
      </li>
      <li class="nav-item mb-2">
        <a class="nav-link <?php echo ($current_page === 'users.php') ? 'active' : ''; ?>" href="users.php">
          <i class="fa-solid fa-users"></i>
          <span class="label">Kullanıcılar</span>
        </a>
      </li>
      <li class="nav-item mb-2">
        <a class="nav-link <?php echo ($current_page === 'tasks.php') ? 'active' : ''; ?>" href="tasks.php">
          <i class="fa-solid fa-list-check"></i>
          <span class="label">Görevler</span>
        </a>
      </li>
    </ul>
  </div>
</nav>
