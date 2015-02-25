#!/usr/bin/env node

var fs = require('fs');

var program = require('commander');
var shell = require('shelljs');


var metaInfo = require('./../package.json');

program
  .version(metaInfo.version)
  .command('release')
  .description('releases the project of the current folder')
  .option("--major", "Increment the major version")
  .option("--minor", "Increment the minor version")
  .option("--patch", "Increment the patch version")
  .action(function(options) {

    // Output help information and exit immediately.
    if (!(options.major || options.minor || options.patch)) {
      program.help();
    }

    // Missing package.json
    if (fs.existsSync('./package.json') === false) {
      console.log('Missing package.json file.');
      process.exit(1);
    }

    var packageJson = JSON.parse(fs.readFileSync('./package.json').toString());
    var currentVersion = packageJson.version;
    var semver = currentVersion.split('.');

    shell.exec('git checkout master');
    shell.exec('git pull --rebase origin master');

    if (options.major) {
      semver[0] = (parseInt(semver[0], 10) + 1).toString();
      semver[1] = '0';
      semver[2] = '0';
    } else if (options.minor) {
      semver[1] = (parseInt(semver[1], 10) + 1).toString();
      semver[2] = '0';
    } else if (options.patch) {
      semver[2] = (parseInt(semver[2], 10) + 1).toString();
    }

    packageJson.version = semver.join('.');
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

    shell.exec('git add package.json');
    shell.exec('git commit -m \'Bumping version to ' + packageJson.version + '\'');
    shell.exec('git tag ' + packageJson.version);
    shell.exec('git push origin master');
    shell.exec('git push origin master --tags');
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
