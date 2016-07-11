<?php
//@todo set recipes directory in variable
require 'recipe/composer.php';
require '/var/www/html/vendor/deployphp/recipes/recipes/cachetool.php'; //add cachetool recipe installed via composer

set('cachetool', '127.0.0.1:9000');
set('repository', '<%= repo %>');

serverlist('servers.yml');

after('deploy:symlink', 'cachetool:clear:opcache');
