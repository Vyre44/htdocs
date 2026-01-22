  <?php
// api/update_status.php - Task status güncelleme
require_once __DIR__ . '/../auth.php';

$id = (int)($_POST['id'] ?? 0);
$status = (int)($_POST['status'] ?? 0);
$requestedUserId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;

if ($id <= 0) {
  error('Geçersiz ID');
}

if ($status < 0 || $status > 4) {
  error('Geçersiz status (0=Silinenler, 1=Başlanmadı, 2=Devam Ediyor, 3=Tamamlandı, 4=Kalıcı Silinenler)');
}

// Hedef kullanıcı: admin başka kullanıcı için güncelleyebilir
$targetUserId = $CURRENT_USER_ID;
if ((int)$CURRENT_USER_ROLE === 2 && $requestedUserId > 0) {
  $targetUserId = $requestedUserId;
}

// Status güncelle (hedef kullanıcının görevi)
$stmt = $pdo->prepare("UPDATE tasks SET status = :status WHERE id = :id AND user_id = :uid");
$stmt->execute(['status' => $status, 'id' => $id, 'uid' => $targetUserId]);

if ($stmt->rowCount() === 0) {
  error('Güncelleme başarısız veya görev bulunamadı');
}

success(['status' => $status]);
