<?php
// Upload test dosyası
echo "<h2>Upload Test</h2>";

$uploadDir = realpath(__DIR__ . "/uploads");
echo "Upload klasörü: " . ($uploadDir ?: "BULUNAMADI") . "<br>";

if ($uploadDir) {
    echo "Yazılabilir mi? " . (is_writable($uploadDir) ? "✅ EVET" : "❌ HAYIR") . "<br>";
    echo "Okunabilir mi? " . (is_readable($uploadDir) ? "✅ EVET" : "❌ HAYIR") . "<br>";
}

echo "<hr>";
echo "PHP upload_max_filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "PHP post_max_size: " . ini_get('post_max_size') . "<br>";
echo "PHP file_uploads: " . (ini_get('file_uploads') ? "✅ Açık" : "❌ Kapalı") . "<br>";
?>
