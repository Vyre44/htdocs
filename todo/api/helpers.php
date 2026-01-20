<?php
/**
 * api/helpers.php - Yardımcı fonksiyonlar
 */

/**
 * JSON response gönder ve çık
 */
function out($arr) {
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Hata response'u gönder
 */
function error($message) {
  out(["ok" => false, "message" => $message]);
}

/**
 * Başarılı response'u gönder
 */
function success($data = []) {
  out(array_merge(["ok" => true], $data));
}
