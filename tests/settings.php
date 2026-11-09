<?php
require '/app/config.inc.php';
require '/app/usr/themes/homecraft-typecho/functions.php';
$fail = static function ($condition, $message) { if (!$condition) throw new RuntimeException($message); };
$good = hcNormalizeSettings(['hcName'=>'My home', 'hcRecentCount'=>'20', 'hcLanguage'=>'en', 'hcGithubUrl'=>'https://github.com/example'], 'Site');
$fail($good['recentCount']===20 && $good['language']==='en' && count($good['links'])===1, 'Valid settings were lost.');
foreach (['javascript:alert(1)','data:text/html,test','file:///etc/passwd','https://user:secret@example.com/','https://example.com/a b'] as $url) $fail(hcWebUrl($url)==='', 'Unsafe public URL was accepted.');
$bad = hcNormalizeSettings(['hcName'=>[], 'hcRecentCount'=>['100'], 'hcLanguage'=>'bad', 'hcSkin'=>'javascript:test', 'hcLogo'=>['x'], 'hcHomepage'=>'bad', 'hcAboutPage'=>['1']], 'Site');
$fail($bad['name']==='Site' && $bad['recentCount']===10 && $bad['skin']==='' && $bad['logo']==='' && $bad['homepage']==='scene' && $bad['aboutPageId']===0, 'Corrupt options did not fall back safely.');
$fail(hcNormalizeSettings(['hcName'=>'0'],'Site')['name']==='0', 'A nonempty numeric display name was lost.');
$weather = ['hcWeatherEnabled'=>'1','hcWeatherCity'=>'Test','hcWeatherLatitude'=>'31.23','hcWeatherLongitude'=>'121.47','hcWeatherTimezone'=>'UTC'];
$fail(hcWeatherSettings($weather)['latitude']===31.23, 'Valid weather settings were lost.');
foreach ([['hcWeatherLatitude'=>'91'],['hcWeatherLongitude'=>'1e999'],['hcWeatherTimezone'=>'Not/A_Zone'],['hcWeatherCity'=>'']] as $override) $fail(hcWeatherSettings(array_merge($weather,$override))===null, 'Invalid weather settings were accepted.');
foreach (['0','21','1.5','bad'] as $count) $fail(hcNormalizeSettings(['hcRecentCount'=>$count],'Site')['recentCount']===10, 'Bad summary count did not use its default.');
echo "Settings normalization and URL/weather boundary checks passed.\n";
