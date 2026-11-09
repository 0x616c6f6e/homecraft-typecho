<?php
/** Synthetic pages for native settings validation, exclusively in the dev database. */
$db = new PDO('sqlite:/app/usr/theme-dev.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->beginTransaction();
foreach (['about'=>['publish','',1,time()-120], 'guestbook'=>['publish','',1,time()-120], 'closed'=>['publish','',0,time()-120], 'private'=>['private','',1,time()-120], 'protected'=>['publish','fixture-password',1,time()-120], 'scheduled'=>['publish','',1,time()+86400]] as $slug=>$data) {
    $q=$db->prepare('SELECT cid FROM typecho_contents WHERE slug=?'); $q->execute(['phase4-'.$slug]); $id=$q->fetchColumn();
    if (!$id) {
        $db->prepare("INSERT INTO typecho_contents (slug,title,text,type,authorId,status,password,allowComment,created,modified) VALUES (?,?,?,'page',1,?,?,?,?,?)")
            ->execute(['phase4-'.$slug,'Phase4 '.$slug,'Synthetic settings page.',$data[0],$data[1],$data[2],$data[3],time()]);
    } else $db->prepare('UPDATE typecho_contents SET status=?, password=?, allowComment=?, created=?, template=NULL WHERE cid=?')->execute([...$data,$id]);
}
$db->commit();
echo "Synthetic settings pages ready.\n";
