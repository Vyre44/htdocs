<?php
// navbar.php - Admin paneli üst navigasyon bar
?>
<nav class="navbar navbar-expand navbar-dark bg-dark sticky-top">
  <div class="container-fluid">
    <button class="btn btn-outline-light btn-sm me-2" id="sidebarToggle" type="button" aria-label="Menüyü Aç/Kapat">
      <i class="fa-solid fa-bars"></i>
    </button>
    <a class="navbar-brand" href="index.php">
      <i class="fa-solid fa-chart-line"></i> Admin Paneli
    </a>
    <div class="ms-auto d-flex align-items-center gap-3">
      <span class="text-white d-flex align-items-center gap-2">
        <i class="fa-solid fa-user-shield"></i>
        <?php echo htmlspecialchars($CURRENT_USERNAME); ?>
      </span>
      <button id="logoutBtn" class="btn btn-sm btn-outline-danger">
        <i class="fa-solid fa-right-from-bracket"></i> Çıkış
      </button>
    </div>
  </div>
</nav>

<script>
  (function() {
    const body = document.body;
    const toggleBtn = document.getElementById('sidebarToggle');
    const collapsed = localStorage.getItem('sidebarCollapsed') === '1';
    if (collapsed) body.classList.add('sidebar-collapsed');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        body.classList.toggle('sidebar-collapsed');
        const isCollapsed = body.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
      });
    }
  })();
</script>
