<?php
require "db.php";

header("Content-Type: application/json; charset=utf-8");

$id = (int)($_POST["id"] ?? 0);
$is_done = (int)($_POST["is_done"] ?? -1);

if ($id <= 0 || ($is_done !== 0 && $is_done !== 1)) {
    echo json_encode(["ok" => false, "message" => "Geçersiz veri"]);
    exit;
}

$stmt = $pdo->prepare("UPDATE tasks SET is_done = :is_done WHERE id = :id");
$stmt->execute([
    "is_done" => $is_done,
    "id" => $id
]);

echo json_encode(["ok" => true, "id" => $id, "is_done" => $is_done]);


