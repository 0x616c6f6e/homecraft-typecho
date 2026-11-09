<?php
/** Synthetic Phase 3 fixtures. Use only inside the isolated development services. */
$db = new PDO('sqlite:/app/usr/theme-dev.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->beginTransaction();
$meta = function ($type, $slug, $name) use ($db) {
    $find = $db->prepare('SELECT mid FROM typecho_metas WHERE slug = ? AND type = ?');
    $find->execute([$slug, $type]);
    $id = $find->fetchColumn();
    if (!$id) {
        $db->prepare('INSERT INTO typecho_metas (name, slug, type, description, count, parent) VALUES (?, ?, ?, ?, 0, 0)')->execute([$name, $slug, $type, 'Synthetic phase 3 fixture']);
        $id = $db->lastInsertId();
    }
    return (int) $id;
};
$category = $meta('category', 'phase3-public', 'Phase3 Public');
$protectedCategory = $meta('category', 'phase3-protected', 'Phase3 Protected');
$tag = $meta('tag', 'phase3-tag', 'Phase3 Tag');
$ids = [];
$put = function ($slug, $title, $text, $status, $created, $password, $mids) use ($db, &$ids) {
    $q = $db->prepare('SELECT cid FROM typecho_contents WHERE slug = ?');
    $q->execute([$slug]);
    $id = $q->fetchColumn();
    $values = [$title, $text, $status, $created, time(), $password];
    if ($id) {
        $db->prepare('UPDATE typecho_contents SET title=?, text=?, status=?, created=?, modified=?, password=? WHERE cid=?')->execute([...$values, $id]);
    } else {
        $db->prepare("INSERT INTO typecho_contents (title,text,status,created,modified,password,slug,type,authorId,allowComment,allowPing,allowFeed) VALUES (?,?,?,?,?,?,?,'post',1,1,1,1)")->execute([...$values, $slug]);
        $id = $db->lastInsertId();
    }
    $db->prepare('DELETE FROM typecho_relationships WHERE cid=?')->execute([$id]);
    foreach ($mids as $mid) $db->prepare('INSERT INTO typecho_relationships (cid,mid) VALUES (?,?)')->execute([$id,$mid]);
    $ids[$slug] = (int) $id;
};
$db->exec("UPDATE typecho_contents SET status='private' WHERE authorId=1 AND title LIKE 'Phase3 lifecycle %'");
$now = time();
$db->prepare('UPDATE typecho_contents SET created=? WHERE cid=1')->execute([$now-86400]);
for ($i=1; $i<=13; $i++) {
    $n = sprintf('%02d', $i);
    $text = "<!--markdown--># Phase3 public article $n\n\nSearchneedle public body $n.\n\n<!--more-->\n\nAdditional article content.";
    if ($i === 1) $text .= "\n\nLiteral text: &lt;script&gt;window.PHASE3_INJECTED=true&lt;/script&gt;";
    $put('phase3-public-'.$n, 'Phase3 public '.$n . ($i === 2 ? ' <script>window.PHASE3_INJECTED=true</script>' : ''), $text, 'publish', $now-3600-$i*60, '', [$category,$tag]);
}
for ($i=1; $i<=12; $i++) {
    $n=sprintf('%02d',$i);
    $put('phase3-protected-'.$n, 'Phase3 protected '.$n, 'PHASE3_PROTECTED_BODY_SECRET', 'publish', $now-$i*60, 'fixture-password', [$protectedCategory]);
}
foreach (['draft','private','hidden','waiting','future'] as $status) {
    $put('phase3-'.$status, 'Phase3 '.$status, 'PHASE3_'.strtoupper($status).'_BODY_SECRET', $status, $now-180, '', [$category,$tag]);
}
$put('phase3-scheduled', 'Phase3 scheduled', 'PHASE3_SCHEDULED_BODY_SECRET', 'publish', $now+86400, '', [$category,$tag]);
$db->exec("UPDATE typecho_metas SET count=(SELECT COUNT(*) FROM typecho_relationships r JOIN typecho_contents c ON c.cid=r.cid WHERE r.mid=typecho_metas.mid AND c.type='post' AND c.status='publish')");
$db->exec("UPDATE typecho_options SET value='5' WHERE name='pageSize' AND user=0");
$db->commit();
echo json_encode(['ids'=>$ids, 'category'=>$category, 'tag'=>$tag], JSON_THROW_ON_ERROR), "\n";
