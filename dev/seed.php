<?php
/** Idempotent synthetic fixture setup; runs exclusively inside the dev container. */
$db = new PDO('sqlite:/app/usr/theme-dev.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// A real native page initializes Archive hooks/feed state; file: front pages return too early.
$homepage = $db->query("SELECT cid FROM typecho_contents WHERE slug = 'scene-home' AND type = 'page'")->fetchColumn();
if (!$homepage) {
    $insert = $db->prepare('INSERT INTO typecho_contents (title, slug, created, modified, text, authorId, template, type, status, allowComment, allowPing, allowFeed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $insert->execute(['Synthetic scene homepage', 'scene-home', time(), time(), 'Synthetic 3D homepage fixture.', 1, 'scene.php', 'page', 'publish', '0', '0', '0']);
    $homepage = $db->lastInsertId();
} else {
    $db->prepare("UPDATE typecho_contents SET template = 'scene.php', status = 'publish' WHERE cid = ?")->execute([$homepage]);
}
$set = $db->prepare('UPDATE typecho_options SET value = ? WHERE name = ? AND user = 0');
foreach ([
    'theme' => 'homecraft-typecho',
    'title' => 'Homecraft Theme Development',
    'description' => 'Synthetic content — isolated migration test',
    'rewrite' => '0',
    'frontPage' => 'page:' . $homepage,
    'frontArchive' => '1',
    'archivePattern' => '/blog',
] as $name => $value) {
    $set->execute([$value, $name]);
}
// Keep installer-created IDs and relationships, replacing only its demonstration content.
$db->prepare("UPDATE typecho_contents SET title = ?, text = ? WHERE cid = 1")
   ->execute(['Synthetic migration article', "<!--markdown--># Theme integration fixture\n\nThis is synthetic test content. No production data is used."]);
$db->prepare("UPDATE typecho_contents SET title = ?, text = ? WHERE cid = 2")
   ->execute(['About this test', '<!--markdown-->An isolated Homecraft / Typecho migration environment.']);
echo "Synthetic fixtures ready; development theme selected.\n";
