<?php
// logout.php - Çıkış işlemi
// Session'u yok et ve JSON response dön

session_start();
session_destroy();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true, 'message' => 'Çıkış başarılı']);
