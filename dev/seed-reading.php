<?php
/** Synthetic reading/comment fixtures; isolated SQLite only. Restore options after testing. */
if (PHP_SAPI !== 'cli') exit(1);
$db = new PDO('sqlite:/app/usr/theme-dev.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$snapshot = '/tmp/homecraft-phase5-options.json';
if (($argv[1] ?? '') === '--restore') {
    if (!is_file($snapshot)) exit(0);
    $set = $db->prepare('UPDATE typecho_options SET value=? WHERE name=? AND user=0');
    foreach (json_decode(file_get_contents($snapshot), true, 512, JSON_THROW_ON_ERROR) as $key=>$value) $set->execute([$value,$key]);
    unlink($snapshot);
    echo "Development comment options restored.\n"; exit;
}
$settings = ['commentsRequireModeration'=>'1','commentsRequireMail'=>'1','commentsRequireUrl'=>'0','commentsThreaded'=>'1','commentsAntiSpam'=>'1','commentsCheckReferer'=>'1','commentsPostIntervalEnable'=>'0','commentsAutoClose'=>'0','commentsPageBreak'=>'1','commentsPageSize'=>'2','commentsPageDisplay'=>'first','commentsOrder'=>'ASC'];
if (!is_file($snapshot)) {
    $old=[];
    $q=$db->prepare('SELECT value FROM typecho_options WHERE name=? AND user=0');
    foreach ($settings as $key=>$value) { $q->execute([$key]); $old[$key]=$q->fetchColumn(); }
    file_put_contents($snapshot,json_encode($old, JSON_THROW_ON_ERROR));
}
$set=$db->prepare('UPDATE typecho_options SET value=? WHERE name=? AND user=0');
foreach ($settings as $key=>$value) $set->execute([$value,$key]);
$long=str_repeat('long_code_',70);
$text="<!--markdown-->## Headings and long content\n\n中文阅读与 English reading.\n\n> A synthetic quotation.\n\n- First item\n- Second item\n\n### Code\n\n```javascript\nconst example = '$long';\n```\n\n### Table\n\n| Column A | Column B | Column C |\n| --- | --- | --- |\n| $long | Value | Value |\n\n![Synthetic large image](/usr/themes/homecraft-typecho/assets/og.jpg)\n";
// Absolute test image URLs also exercise the subdirectory installation.
$site=$db->query("SELECT value FROM typecho_options WHERE name='siteUrl' AND user=0")->fetchColumn();
$text=str_replace('](/usr/',']('.rtrim($site,'/').'/usr/',$text);
foreach (['reading'=>['',1], 'protected'=>['fixture-password',1]] as $slug=>$values) {
    $q=$db->prepare('SELECT cid FROM typecho_contents WHERE slug=?');$q->execute(['phase5-'.$slug]);$id=$q->fetchColumn();
    if (!$id) {
        $db->prepare("INSERT INTO typecho_contents (slug,title,text,type,authorId,status,password,allowComment,created,modified) VALUES (?,?,?,'page',1,'publish',?,?,?,?)")->execute(['phase5-'.$slug,'Phase5 '.$slug,$text,...$values,time()-120,time()]);
        $id=$db->lastInsertId();
    } else $db->prepare('UPDATE typecho_contents SET text=?, password=?, allowComment=?, created=? WHERE cid=?')->execute([$text,...$values,time()-120,$id]);
    $db->prepare('DELETE FROM typecho_comments WHERE cid=?')->execute([$id]);
    for($i=1;$i<=3;$i++) $db->prepare("INSERT INTO typecho_comments (cid,created,author,mail,url,ip,agent,text,type,status,ownerId,parent) VALUES (?,?,?,'fixture@example.invalid','','127.0.0.1','fixture',?,'comment','approved',1,0)")->execute([$id,time()-60+$i,'Fixture reader '.$i,'Phase5 approved '.$i]);
    $db->prepare('UPDATE typecho_contents SET commentsNum=3 WHERE cid=?')->execute([$id]);
}
echo "Synthetic reading/comment fixtures ready.\n";
