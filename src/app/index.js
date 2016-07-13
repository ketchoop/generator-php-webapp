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
      'Welcome to the grand ' + chalk.red('PHP webapp') + ' generator!'
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
      }
    ];

    const deployerPrompts = [
      {
        name: 'name',
        message: 'Server name',
        default: 'production'
      },
      {
        name: 'host',
        message: 'Host',
        default: 0
      },
      {
        name: 'port',
        message: 'Server port',
        default: 0
      },
      {
        name: 'user',
        message: 'Username',
        default: 'user'
      },
      {
        type: "password",
        name: 'pass',
        message: 'Password',
        default: 'pass'
      },
      {
        name: 'stage',
        message: 'stage',
        default: 'production'
      },
      {
        name: 'deployPath',
        message: 'Deploy path',
        default: '/var/www/html'
      },
      {
        name: 'branch',
        message: 'Branch',
        default: 'master'
      },
      {
        type: 'confirm',
        name: 'doSpecifyAnotherServer',
        message: 'Do specify another server?',
        default: false
      }
    ];

    return this.prompt(prompts).then(answers  => {
      this.answers = answers;

      if (answers.doUseDeployer) {
        this.answers.deployer = [];

        const promptLoop = () =>
        this.prompt(deployerPrompts).then(answers => {
          this.answers.deployer.push(answers);

          if (answers.doSpecifyAnotherServer) {
            return promptLoop();
          }
        });
        
        return promptLoop();
      }
    });
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
          this.template('_servers.yml', 'servers.yml', { deployer: this.answers.deployer });
        }
      },
      codeChecking() {
        this.template('phpcs.xml');
        this.template('_phpci.yml', 'phpci.yml', {
          email: this.answers.email,
          deployer: this.answers.deployer
        });
      },
      other() {
        this.template('gitignore', '.gitignore');
      }
    };
  }

  get install () {
    return {

      composer() {
        this.spawnCommand('composer', ['install']);//TODO needs more gold(arguments)
      },

      gitInit() {
        const branches = ['staging', 'dev'];

        console.log(`Initializing git repo ${this.answers.repo}`);
        this.spawnCommand('git', ['init']);
        this.spawnCommand('git', ['remote', 'add', 'origin', this.answers.repo]);

      }
    };
  }
}

