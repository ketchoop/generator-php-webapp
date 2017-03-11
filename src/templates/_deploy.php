<?php
require 'recipe/composer.php';
require './vendor/deployer/recipes/cachetool.php'

set('cachetool', '127.0.0.1:9000');
set('repository', '<%= repo %>');

serverlist('servers.yml');

after('deploy:symlink', 'cachetool:clear:opcache');

