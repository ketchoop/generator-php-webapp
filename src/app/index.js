import { Base } from 'yeoman-generator';
import path from 'path';
import chalk from 'chalk';
import yosay from 'yosay';
import mkdirp from 'mkdirp';

export default class PhpGenerator extends Base {
  constructor( ...args ) {
    super(...args);
    this.argument('appname', { required: false, default: this.appname });
  }

  prompting () {
    // Have Yeoman greet the user.
    console.log(yosay(
      'Welcome to the grand ' + chalk.red('WebApp-PHP') + ' generator!'
    ));

    console.log(chalk.bold.yellow(`Let's create your awesome ${chalk.underline.bold.red(this.appname)} project!\n`));

    var prompts = [
      {
        name: 'author',
        message: 'Author',
        default: ''
      },
      {
        name: 'email',
        message: 'Email',
        default: ''
      },
      {
        name: 'repo',
        message: 'Repository',
        default: ''
      },
      {
        type: 'confirm',
        name: 'doUseDeployer',
        message: 'Do you want to use deployer?',
        default: false
      },
      {
        when(answer) {
          return answer.doUseDeployer;
        },
        name: 'serverHost',
        message: 'Host',
        default: 0
      },
      {
        when(answer) {
          return answer.doUseDeployer;
        },
        name: 'serverPort',
        message: 'Server port',
        default: 0
      },
      {
        when(answer) {
          return answer.doUseDeployer;
        },
        name: 'serverUser',
        message: 'Username',
        default: 'user'
      },
      {
        when(answer) {
          return answer.doUseDeployer;
        },
        name: 'serverPass',
        message: 'Password',
        default: 'pass'
      },
      {
        when(answer) {
          return answer.doUseDeployer;
        },
        name: 'deployPath',
        message: 'Deploy path',
        default: '/var/www/html'
      }
    ];

    return this.prompt(prompts).then(function (answers) {
      // To access props later use this.props.someAnswer;
      this.answers = answers;
    }.bind(this));
  }
  get writing () {
    return {
      structure() {
        const folders = [
          'src/lib',
          'web',
          'tests'
        ];

        folders.forEach(folder => mkdirp(folder));
      },
      composerJson() {
        this.template(
          '_composer.json',
          'composer.json',
          {
            appname: this.appname,
            author: this.answers.author,
            email: this.answers.email
          }
        )
      },
      phpunit() {
        this.template('phpunit.xml');
      },
      deployer() {
        if (this.answers.doUseDeployer) {
          this.template('_deploy.php', 'deploy.php', {repo: this.answers.repo});
          this.template('_servers.yml', 'servers.yml', {
            serverHost: this.answers.serverHost,
            serverPort: this.answers.serverPort,
            serverUser: this.answers.serverUser,
            serverPass: this.answers.serverPass,
            deployPath: this.answers.deployPath
          });
        }
      }
    };
  }

  gitInit() {
    console.log(`Initializing git repo ${this.answers.repo}`);
    this.spawnCommand('git', ['init']);
    this.spawnCommand('git', ['remote', 'add', 'origin', this.answers.repo]);
  }

  install () {
    this.spawnCommand('composer', ['install']);//TODO needs more gold(arguments)
  }
}
