<?php
// api/trash_list.php - Çöp kutusu listesi

$rows = $pdo->query("SELECT * FROM trash ORDER BY deleted_at DESC, id DESC")->fetchAll();

success(["items" => $rows]);
