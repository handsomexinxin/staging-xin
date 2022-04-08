'use strict';

module.exports = exec;
const Package = require("@puteng-staging/package");
const log = require("@puteng-staging/log")

const SETTINGS = {
    init: "@puteng-staging/init"
}

function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = "latest";
    const pkg = new Package({targetPath, homePath, packageName, packageVersion})
    if(targetPath === undefined) {
        targetPath = ""// 缓存路径
    }
    console.log(pkg.getRootFilePath());
}
