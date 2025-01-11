<?php
error_reporting(0);

$glob_curl_headers = [
    'ssl_verifypeer' => 0,
    'ssl_verifyhost' => 0,
    //'proxy' => 'http://country-worldwide:63ca19f9-b895-4439-95ee-92cfc91a30b1@proxy.proxyverse.io:9200'
];
$glob_http_headers = [
    'User-Agent' => 'Grab/5.318.0 (Android 11; Build 80919676)'
];

extract(json_decode(base64_decode($argv[1]), 1));


echo Request (
    $url,
    $options
);

function Request (
    $url,
    $data = []
) {
    $data[curlopt('returntransfer')] = 1;
    
    foreach ($GLOBALS['glob_curl_headers'] as $name => $value) {
        $data[curlopt($name)] = $value;
    }
    if($data['proxy_disable'] == true) {
        unset($data[10004], $data[10006], $data['proxy_disable']);
    }
    foreach ($GLOBALS['glob_http_headers'] as $name => $value) {
        $data['httpheader'][] = $name . ': ' . $value;
    }
    foreach($data as $n => $s) {
        if(!is_int($n)) {
            $data[curlopt($n)] = $s;
            unset($data[$n]);
        }
    }
    //echo 'Sending request to: ' . $url . "\n";
    curl_setopt_array (
        ($curl = curl_init($url)),
        $data
    );
    $response = curl_exec($curl);
    return $response;
}
function curlopt ($a) {
    return eval('return CURLOPT_'.strtoupper($a).';');
}
function g($i, $l, $y)
{
    return explode($y, explode($l, $i)[1])[0];
}
function getRandomUserAgent() {
    $platforms = array(
        'Windows NT 10.0',
        'Windows NT 6.1',
        'Windows NT 6.3',
        'Macintosh; Intel Mac OS X 10_15_7',
        'Macintosh; Intel Mac OS X 10_14_6',
        'X11; Linux x86_64',
        'iPhone; CPU iPhone OS 14_4 like Mac OS X',
        'iPad; CPU OS 14_4 like Mac OS X',
        'Android 11.0; Mobile'
    );

    $browsers = array(
        'Chrome',
        'Firefox',
        'Safari',
        'Edge',
        'Opera'
    );

    $platform = $platforms[array_rand($platforms)];
    $browser = $browsers[array_rand($browsers)];
    $version = mt_rand(50, 100) . '.' . mt_rand(0, 9) . '.' . mt_rand(0, 9) . '.' . mt_rand(0, 9);

    return "Mozilla/5.0 ($platform) AppleWebKit/537.36 (KHTML, like Gecko) $browser/$version";
}
?>