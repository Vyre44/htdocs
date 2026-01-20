<?php
// api/list.php - Task listesini getir

// Tamamlanmamışlar önce, sıralı olarak getir
$tasks = $pdo->query("
  SELECT * 
  FROM tasks 
  ORDER BY is_done ASC, sort_order ASC, id DESC
")->fetchAll();

success(["tasks" => $tasks]);
