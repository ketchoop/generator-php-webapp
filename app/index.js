'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _yeomanGenerator = require('yeoman-generator');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _yosay = require('yosay');

var _yosay2 = _interopRequireDefault(_yosay);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PhpGenerator = function (_Base) {
  _inherits(PhpGenerator, _Base);

  function PhpGenerator() {
    var _Object$getPrototypeO;

    _classCallCheck(this, PhpGenerator);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(PhpGenerator)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this.argument('appname', { required: false, default: _this.appname });
    return _this;
  }

  _createClass(PhpGenerator, [{
    key: 'prompting',
    value: function prompting() {
      // Have Yeoman greet the user.
      console.log((0, _yosay2.default)('Welcome to the grand ' + _chalk2.default.red('WebApp-PHP') + ' generator!'));

      console.log(_chalk2.default.bold.yellow('Let\'s create your awesome ' + _chalk2.default.underline.bold.red(this.appname) + ' project!\n'));

      var prompts = [{
        name: 'author',
        message: 'Author',
        default: ''
      }, {
        name: 'email',
        message: 'Email',
        default: ''
      }, {
        name: 'repo',
        message: 'Repository',
        default: ''
      }, {
        type: 'confirm',
        name: 'doConfigureDeploy',
        message: 'Set production server deployer settings?',
        default: false
      }, {
        when: function when(answer) {
          return answer.doConfigureDeploy;
        },

        name: 'serverHost',
        message: 'Host',
        default: 0
      }, {
        when: function when(answer) {
          return answer.doConfigureDeploy;
        },

        name: 'serverPort',
        message: 'Server port',
        default: 0
      }, {
        when: function when(answer) {
          return answer.doConfigureDeploy;
        },

        name: 'serverUser',
        message: 'Username',
        default: 'user'
      }, {
        when: function when(answer) {
          return answer.doConfigureDeploy;
        },

        name: 'serverPass',
        message: 'Password',
        default: 'pass'
      }, {
        when: function when(answer) {
          return answer.doConfigureDeploy;
        },

        name: 'deployPath',
        message: 'Deploy path',
        default: '/var/www/html'
      }];

      return this.prompt(prompts).then(function (answers) {
        // To access props later use this.props.someAnswer;
        this.answers = answers;
      }.bind(this));
    }
  }, {
    key: 'gitInit',
    value: function gitInit() {
      console.log('Initializing git repo ' + this.answers.repo);
      this.spawnCommand('git', ['init']);
      this.spawnCommand('git', ['remote', 'add', 'origin', this.answers.repo]);
    }
  }, {
    key: 'install',
    value: function install() {
      this.spawnCommand('composer', ['install']); //TODO needs more gold(arguments)
    }
  }, {
    key: 'writing',
    get: function get() {
      return {
        structure: function structure() {
          var folders = ['src/lib', 'docs', 'web', 'tests'];

          folders.forEach(function (folder) {
            return (0, _mkdirp2.default)(folder);
          });
        },
        composerJson: function composerJson() {
          this.template('_composer.json', 'composer.json', {
            appname: this.appname,
            author: this.answers.author,
            email: this.answers.email
          });
        },
        phpunit: function phpunit() {
          this.template('phpunit.xml');
        },
        deployer: function deployer() {
          this.template('_deploy.php', 'deploy.php', { repo: this.answers.repo });
          this.template('_servers.yml', 'servers.yml', {
            serverHost: this.answers.serverHost,
            serverPort: this.answers.serverPort,
            serverUser: this.answers.serverUser,
            serverPass: this.answers.serverPass,
            deployPath: this.answers.deployPath
          });
        }
      };
    }
  }]);

  return PhpGenerator;
}(_yeomanGenerator.Base);

exports.default = PhpGenerator;
module.exports = exports['default'];