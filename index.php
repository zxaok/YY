<?php
// index.php
function initCurl($url, $headers = []) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 10
    ]);
    return $ch;
}

// 简单校验 id，避免注入或异常字符
$rid = isset($_GET['id']) ? preg_replace('/[^0-9a-zA-Z_\-]/', '', trim($_GET['id'])) : '1354210357';

$ch = initCurl(
    "http://interface.yy.com/hls/new/get/{$rid}/{$rid}/1200?source=wapyy&callback=jsonp3",
    ['User-Agent: Mozilla/5.0','Referer: http://www.yy.com/']
);
$body = curl_exec($ch);
if ($body === false) {
    http_response_code(502);
    exit('请求失败');
}
if (!preg_match('/"hls":"(.*?)"/', $body, $m)) {
    curl_close($ch);
    http_response_code(404);
    exit('未找到有效的HLS地址');
}
curl_close($ch);

$hls = str_replace('\\/', '/', $m[1]);
$ch = initCurl($hls, ['Referer: https://wap.yy.com/', 'Accept: */*']);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_exec($ch);
$url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL) ?: null;
curl_close($ch);

if (!$url) {
    http_response_code(500);
    exit('无法获取最终跳转地址');
}

// 直接跳转到最终地址
header("Location: $url");
exit;
