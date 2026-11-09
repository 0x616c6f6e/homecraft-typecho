#!/usr/bin/env bash
set -eu
umask 077
mkdir -p /app/usr
chown www-data:www-data /app/usr
export TYPECHO_USER_PASSWORD="$(cat /run/secrets/admin-password)"
touch /tmp/theme-dev-install.log
chmod 600 /tmp/theme-dev-install.log
# Installer can print credentials: keep its output inside this disposable container.
/usr/bin/init_typecho cli > /tmp/theme-dev-install.log 2>&1 </dev/null || true
if [ ! -f /app/config.inc.php ]; then
  echo 'Development Typecho installation failed; inspect private /tmp/theme-dev-install.log.' >&2
  exit 1
fi
unset TYPECHO_USER_PASSWORD TYPECHO_INSTALL
php /dev-tools/seed.php
if [ "${HC_DEV_SUBDIRECTORY:-}" = journal ]; then
  mkdir -p /var/www/theme-dev-empty
  cat > /etc/apache2/sites-available/000-default.conf <<'APACHE'
<VirtualHost *:80>
    DocumentRoot /var/www/theme-dev-empty
    Alias /journal/ /app/
    <Directory /app>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
APACHE
  # The image ships a root-only rewrite target; this disposable instance needs its prefix.
  cat > /app/.htaccess <<'HTACCESS'
RewriteEngine On
RewriteBase /journal/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /journal/index.php/$1 [L]
HTACCESS
fi
exec apachectl -D FOREGROUND
