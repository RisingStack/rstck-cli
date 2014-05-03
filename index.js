#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var program = require('commander');
var shell = require('shelljs');


var metaInfo = require('./package.json');

program
  .version(metaInfo.version);

program
  .command('release')
  .description('releases the project of the current folder')
  .option("--major", "Increment the major version")
  .option("--minor", "Increment the minor version")
  .option("--patch", "Increment the patch version")
  .action(function(options){

    var packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')).toString());
    var currentVersion = packageJson.version;
    var semver = currentVersion.split('.');

    if (options.major) {
      semver[0] = (parseInt(semver[0], 10) + 1).toString();
    } else if (options.minor) {
      semver[1] = (parseInt(semver[1], 10) + 1).toString();
    } else if (options.patch) {
      semver[2] = (parseInt(semver[2], 10) + 1).toString();
    }

    packageJson.version = semver.join('.');
    fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson));

    shell.exec('git checkout master');
    shell.exec('git pull');
    shell.exec('git tag ' + semver);
    shell.exec('git push origin master');

  });

program.parse(process.argv);
