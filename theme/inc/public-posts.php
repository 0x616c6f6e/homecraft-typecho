<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** Native content access with stricter public-only filtering for shared scene data. */
class HomecraftPublicPosts extends \Widget\Base\Contents
{
    public function execute()
    {
        $this->parameter->setDefault(['pageSize' => 10]);
        $this->db->fetchAll($this->select()
            ->where('table.contents.type = ?', 'post')
            ->where('table.contents.status = ?', 'publish')
            ->where('table.contents.created < ?', $this->options->time)
            ->where("table.contents.password IS NULL OR table.contents.password = ''")
            ->order('table.contents.created', \Typecho\Db::SORT_DESC)
            ->order('table.contents.cid', \Typecho\Db::SORT_DESC)
            ->limit((int) $this->parameter->pageSize), [$this, 'push']);
    }
}
