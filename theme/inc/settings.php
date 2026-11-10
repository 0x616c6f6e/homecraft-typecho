<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** Validate public browser URLs without fetching administrator-supplied resources. */
function hcWebUrl($value): string
{
    if (!is_string($value)) return '';
    $value = trim($value);
    if (strlen($value) > 2048 || preg_match('/[\x00-\x20\x7f]/', $value) || !filter_var($value, FILTER_VALIDATE_URL)) return '';
    $parts = parse_url($value);
    return $parts && in_array(strtolower($parts['scheme'] ?? ''), ['http','https'], true)
        && !empty($parts['host']) && !isset($parts['user']) && !isset($parts['pass']) ? $value : '';
}

function hcSettingText($value, int $length): string
{
    return is_string($value) ? \Typecho\Common::subStr(trim($value), 0, $length) : '';
}

function hcWeatherSettings(array $raw): ?array
{
    if (($raw['hcWeatherEnabled'] ?? '0') !== '1') return null;
    $city = hcSettingText($raw['hcWeatherCity'] ?? '', 80);
    $cityEn = hcSettingText($raw['hcWeatherCityEn'] ?? '', 80) ?: $city;
    $latitude = $raw['hcWeatherLatitude'] ?? '';
    $longitude = $raw['hcWeatherLongitude'] ?? '';
    $timezone = hcSettingText($raw['hcWeatherTimezone'] ?? '', 80) ?: 'UTC';
    if (!$city || !is_scalar($latitude) || !is_scalar($longitude)
        || !is_numeric($latitude) || !is_numeric($longitude)
        || !is_finite((float) $latitude) || abs((float) $latitude) > 90
        || !is_finite((float) $longitude) || abs((float) $longitude) > 180
        || !in_array($timezone, \DateTimeZone::listIdentifiers(\DateTimeZone::ALL_WITH_BC), true)) return null;
    return ['city'=>$city, 'cityEn'=>$cityEn, 'latitude'=>(float)$latitude, 'longitude'=>(float)$longitude, 'timezone'=>$timezone];
}

/** Pure normalization also protects rendering from stale or manually corrupted options. */
function hcNormalizeSettings(array $raw, string $siteTitle): array
{
    $count = $raw['hcRecentCount'] ?? '10';
    $count = is_scalar($count) && ctype_digit((string)$count) && (int)$count >= 1 && (int)$count <= 20 ? (int)$count : 10;
    $language = ($raw['hcLanguage'] ?? '') === 'en' ? 'en' : 'zh';
    $name = hcSettingText($raw['hcName'] ?? '',80);
    $links = [];
    foreach (['hcGithubUrl'=>['github','GitHub'], 'hcWebsiteUrl'=>['blog',$language === 'en' ? 'Website' : '网站'], 'hcXUrl'=>['x','X']] as $key=>$info) {
        $url = hcWebUrl($raw[$key] ?? '');
        if ($url) $links[] = ['id'=>$info[0], 'name'=>$info[1], 'url'=>$url];
    }
    $pageId = static fn($value) => is_scalar($value) && ctype_digit((string)$value) ? (int)$value : 0;
    return [
        'name'=>$name !== '' ? $name : $siteTitle,
        'introduction'=>hcSettingText($raw['hcIntroduction'] ?? '',2000),
        'skin'=>hcWebUrl($raw['hcSkin'] ?? ''), 'logo'=>hcWebUrl($raw['hcLogo'] ?? ''), 'favicon'=>hcWebUrl($raw['hcFavicon'] ?? ''),
        'language'=>$language, 'recentCount'=>$count,
        'world'=>in_array($raw['hcWorld'] ?? '', ['show-home','village','starter'], true) ? $raw['hcWorld'] : 'show-home',
        'homepage'=>($raw['hcHomepage'] ?? '') === 'reading' ? 'reading' : 'scene',
        'aboutPageId'=>$pageId($raw['hcAboutPage'] ?? 0), 'guestbookPageId'=>$pageId($raw['hcGuestbookPage'] ?? 0),
        'links'=>$links, 'weather'=>hcWeatherSettings($raw),
    ];
}

function hcSettings(): array
{
    static $settings;
    if (isset($settings)) return $settings;
    $options = \Utils\Helper::options();
    $keys = ['hcWorld','hcName','hcIntroduction','hcSkin','hcLogo','hcFavicon','hcLanguage','hcRecentCount','hcHomepage','hcAboutPage','hcGuestbookPage','hcGithubUrl','hcWebsiteUrl','hcXUrl','hcWeatherEnabled','hcWeatherCity','hcWeatherCityEn','hcWeatherLatitude','hcWeatherLongitude','hcWeatherTimezone'];
    $raw = [];
    foreach ($keys as $key) $raw[$key] = $options->{$key};
    return $settings = hcNormalizeSettings($raw, (string)$options->title);
}

function hcText(string $zh, string $en): string
{
    return hcSettings()['language'] === 'en' ? $en : $zh;
}

/** No body or account data is exposed by selectable page metadata. */
function hcAvailablePages(): array
{
    static $result;
    if (isset($result)) return $result;
    require_once __DIR__ . '/public-pages.php';
    $pages = HomecraftPublicPages::alloc();
    $result = [];
    while ($pages->next()) $result[(int)$pages->cid] = ['title'=>(string)$pages->title,'url'=>(string)$pages->permalink,'comments'=>(bool)$pages->allowComment];
    return $result;
}

function hcMappedPages(array $settings): array
{
    $available = ($settings['aboutPageId'] || $settings['guestbookPageId']) ? hcAvailablePages() : [];
    $about = $available[$settings['aboutPageId']] ?? null;
    $guestbook = $available[$settings['guestbookPageId']] ?? null;
    if ($guestbook && !$guestbook['comments']) $guestbook = null;
    $project = static fn($page) => $page ? ['title'=>$page['title'],'url'=>$page['url']] : null;
    return ['about'=>$project($about), 'guestbook'=>$project($guestbook)];
}

function themeConfig($form)
{
    $text = static function ($key,$label,$default='',$description='') use ($form) {
        $field = new \Typecho\Widget\Helper\Form\Element\Text($key,null,$default,$label,$description);
        $form->addInput($field);
        return $field;
    };
    $select = static function ($key,$label,$values,$default) use ($form) {
        $field = new \Typecho\Widget\Helper\Form\Element\Select($key,$values,$default,$label);
        $field->addRule('required','请选择有效选项。')->addRule('enum','请选择有效选项。',array_map('strval',array_keys($values)));
        $form->addInput($field);
        return $field;
    };
    $text('hcName','显示名称','','留空时使用 Typecho 站点名称。')->addRule('maxLength','名称最多 80 字。',81);
    $intro = new \Typecho\Widget\Helper\Form\Element\Textarea('hcIntroduction',null,'','个人介绍','纯文本，最多 2000 字；留空使用站点描述。');
    $intro->addRule('maxLength','介绍最多 2000 字。',2001); $form->addInput($intro);
    foreach (['hcSkin'=>['角色皮肤 URL','64×64 PNG，4px 手臂，建议不超过 18 KB；留空使用默认角色。'], 'hcLogo'=>['站点 Logo URL','留空不显示图片 Logo。'], 'hcFavicon'=>['站点图标 URL','留空使用主题默认图标。'], 'hcGithubUrl'=>['GitHub URL',''], 'hcWebsiteUrl'=>['个人网站 URL',''], 'hcXUrl'=>['X URL','']] as $key=>$info) {
        $text($key,$info[0],'',$info[1])->addRule(static fn($value)=>hcWebUrl($value)!=='','请填写无账号密码的完整 HTTP/HTTPS URL，或留空。');
    }
    $select('hcLanguage','界面语言',['zh'=>'中文','en'=>'English'],'zh');
    $text('hcRecentCount','首页文章数量','10','1–20；不影响 Typecho 原生归档每页数量。')->addRule('required','请填写 1–20 的整数。')->addRule(static fn($v)=>is_scalar($v)&&ctype_digit((string)$v)&&(int)$v>=1&&(int)$v<=20,'请填写 1–20 的整数。');
    $select('hcWorld','场景建筑',['show-home'=>'原项目示范住宅','village'=>'木屋、书屋与瞭望塔','starter'=>'原始空岛'],'show-home');
    $select('hcHomepage','首页展示',['scene'=>'3D 场景','reading'=>'文章阅读（转到原生文章列表）'],'scene');
    $pageOptions = ['0'=>'不关联页面']; $guestOptions = $pageOptions;
    foreach (hcAvailablePages() as $id=>$page) {
        $label=htmlspecialchars($page['title'],ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
        $pageOptions[(string)$id]=$label;
        if ($page['comments']) $guestOptions[(string)$id]=$label;
    }
    $select('hcAboutPage','关于页面',$pageOptions,'0');
    $select('hcGuestbookPage','留言页面（需开启评论）',$guestOptions,'0');
    $weather = $select('hcWeatherEnabled','实时天气',['0'=>'关闭','1'=>'开启'],'0');
    $weather->addRule(static function($value) {
        if ($value !== '1') return true;
        $raw=['hcWeatherEnabled'=>'1'];
        foreach (['hcWeatherCity','hcWeatherCityEn','hcWeatherLatitude','hcWeatherLongitude','hcWeatherTimezone'] as $key) $raw[$key]=\Typecho\Request::getInstance()->get($key);
        return hcWeatherSettings($raw)!==null;
    },'启用天气需要城市、有效经纬度及 IANA 时区（留空默认 UTC）。');
    $text('hcWeatherCity','天气城市'); $text('hcWeatherCityEn','城市英文名称（可留空）');
    $text('hcWeatherLatitude','纬度','','-90 至 90。'); $text('hcWeatherLongitude','经度','','-180 至 180。');
    $text('hcWeatherTimezone','天气时区','UTC','例如 UTC 或 Asia/Shanghai。天气请求在访客浏览器中执行。');
}
