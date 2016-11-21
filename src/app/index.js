import { Base } from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import mkdirp from 'mkdirp';

export default class PhpGenerator extends Base {
  constructor(...args) {
    super(...args);
    this.argument('appname', { required: false, default: this.appname });
  }

  prompting () {
    // Have Yeoman greet the user.
    console.log(yosay(
      'Welcome to the grand ' + chalk.red('PHP webapp') + ' generator!'
    ));

    console.log(
      chalk.bold.yellow(`Let's create your awesome 
        ${chalk.underline.bold.red(this.appname)} project!\n`)
    );

    const gitInfoCommands= {
      'repo': ['remote', 'get-url', 'origin'],
      'name': ['config', 'user.name'],
      'email': ['config', 'user.email']
    };

    let gitInfo = {};

    for (let info in gitInfoCommands) {
      const command = gitInfoCommands[info];
      gitInfo[info] = this
        .spawnCommandSync('git', command, { stdio: null })
        .stdout;
    }

    var prompts = [
      {
        name: 'author',
        message: 'Author',
        default: gitInfo.name
      },
      {
        name: 'email',
        message: 'Email',
        default: gitInfo.email
      },
      {
        type: 'confirm',
        name: 'specifyNs',
        message: 'Do you want to specify basic autoload configuration' +
        '(vendor namespace and project namespace) for composer?',
        default: false
      },
      {
        when(answers) {
          return answers.specifyNs;
        },

        name: 'nsPrefix',
        message: 'Composer base namespace(vendor namespace and project namespace) for src/lib',
        filter(answer) {
          return answer.replace('\\', '\\\\');
        }
      },
      {
        type: 'list',
        name: 'nsStandard',
        message: 'Choose autoload standard',
        choices: ['psr4', 'psr0']
      },
      {
        name: 'repo',
        message: 'Repository',
        default: gitInfo.repo
      },
      {
        type: 'confirm',
        name: 'doUseCi',
        message: 'Do you want to create PHPCI configuration?',
        default: false
      },
      {
        type: 'confirm',
        name: 'doUseDeployer',
        message: 'Do you want to create deployer configuration?',
        default: false
      }
    ];

    const deployerPrompts = [
      {
        name: 'name',
        message: 'Server alias(only for deployer)',
        default: 'production'
      },
      {
        name: 'host',
        message: 'Host',
        default: 0
      },
      {
        name: 'port',
        message: 'Server ssh port',
        default: 22
      },
      {
        name: 'user',
        message: 'Username',
        default: 'user'
      },
      {
        type: 'password',
        name: 'pass',
        message: 'Password',
        default: 'pass'
      },
      {
        name: 'stage',
        message: 'stage',
        default(answers) {
          return answers.name;
        }
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

        const promptLoop = () => this.prompt(deployerPrompts)
          .then(answers => {
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
            email: this.answers.email,
            specifyNs: this.answers.specifyNs,
            nsPrefix: this.answers.nsPrefix,
            nsStandard: this.answers.nsStandard
          }
        );
      },

      phpunit() {
        this.template('phpunit.xml');
      },

      deployer() {
        if (this.answers.doUseDeployer) {
          this.template('_deploy.php', 'deploy.php', { repo: this.answers.repo });
          this.template('_servers.yml', 'servers.yml', { deployer: this.answers.deployer });
        }
      },

      codeChecking() {
        this.template('phpcs.xml');
      },

      ci() {
        if (this.answers.doUseCi) {
          this.template('_phpci.yml', 'phpci.yml', {
            email: this.answers.email,
            deployer: this.answers.deployer
          });
        }
      },

      other() {
        this.template('gitignore', '.gitignore');
      }
    };
  }

  get install () {
    return {

      composer() {
        this.spawnCommand('composer', ['install'])//TODO needs more gold(arguments)
          .on('error', err => {
            switch (err.code) {
              case 'ENOENT':
                console.error('Couldn\'t find composer binary, please specify your path.');
                break;
              default:
                console.error('Something went wrong with composer install. Code ', err.code);
            }
          });
      },

      git() {
        this.spawnCommand('git', ['status'], { stdio: null })
          .on('close', code => {
            if (code != 0) {
              console.log(`Initializing git repo ${this.answers.repo}`);

              this.spawnCommand('git', ['init'])
                .on('close', code => {
                  if (!code) {
                    this.spawnCommand('git', ['remote', 'add', 'origin', this.answers.repo]);
                  }
                })
                .on('error', err => {
                  switch (err.code) {
                    case 'ENOENT':
                      console.error('Couldn\'t find git binary, please specify your path.');
                      break;
                    default:
                      console.error('Something went wrong with git init. Code ', err.code);
                  }
                });
            }
          });
      }
    };
  }
}

