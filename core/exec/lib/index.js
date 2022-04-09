'use strict';

const path = require("path");
const Package = require("@puteng-staging/package");
const log = require("@puteng-staging/log")

const SETTINGS = {
    init: "@puteng-staging/init"
}
const CACHE_DIR = "dependencies"

function exec() {
    let pkg;
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = ""
    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = "latest";
    if(targetPath === undefined) {
        targetPath = path.resolve(homePath, CACHE_DIR)// 缓存路径
        storeDir = path.resolve(targetPath, "node_modules")
        log.verbose("targetPath", targetPath)
        log.verbose("storeDir", storeDir)
        pkg = new Package({targetPath, homePath, packageName, packageVersion, storeDir})
        if(pkg.exists()) {
            // 存在则更新package
    
        }else {
            // 安装package
            pkg.install()

        }
    } else {
        pkg = new Package({targetPath, packageName, packageVersion})
        const rootFile = pkg.getRootFilePath();
        require(rootFile).apply(null, arguments);

    }
    // console.log(pkg.getRootFilePath());
}
module.exports = exec;
