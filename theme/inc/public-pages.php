<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

class HomecraftPublicPages extends \Widget\Base\Contents
{
    public function execute()
    {
        $this->db->fetchAll($this->select()
            ->where('table.contents.type = ?', 'page')
            ->where('table.contents.status = ?', 'publish')
            ->where('table.contents.created < ?', $this->options->time)
            ->where("table.contents.password IS NULL OR table.contents.password = ''")
            ->where("table.contents.template IS NULL OR table.contents.template != 'scene.php'")
            ->order('table.contents.order', \Typecho\Db::SORT_ASC), [$this, 'push']);
    }
}
