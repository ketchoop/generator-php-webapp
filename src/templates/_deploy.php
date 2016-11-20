<?php
require 'recipe/composer.php';

set('cachetool', '127.0.0.1:9000');
set('repository', '<%= repo %>');

serverlist('servers.yml');

