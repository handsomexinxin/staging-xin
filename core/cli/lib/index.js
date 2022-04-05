'use strict';
const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const {homedir} = require("os");
const minimist = require('minimist');
const pathExists = require("path-exists");
const utils = require("@puteng-staging/utils");
const log = require("@puteng-staging/log");
const pkg = require("../package.json");
const {LOW_NODE_VERSION, DEFAULT_CLI_HOME} = require("./const");
const useHome = homedir()
let args;
utils()
module.exports = core;
// utils()
async function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        checkInputArgs();
        // log.verbose("debug", "test debug log");
        checkEnv();
        await checkGlobalUpdate();
    } catch (e) {
        log.error(e.message);
    }
};

function checkPkgVersion() {// 输出当前包版本
    log.notice("cli", pkg.version);
};

function checkNodeVersion() {// 检查node版本
    const currentVersion = process.version;
    if (semver.gte(LOW_NODE_VERSION, currentVersion)) {
        throw new Error(colors.red("puteng-staging 需要安装 ${LOW_NODE_VERSION} 以上版本的 Node.js"))
    }
    log.info(process.version);
}

function checkRoot() {// 检查执行权限
    require("root-check")();// 需要修改文件  防止修改高级权限文件  将执行权限降级为普通权限（mac 501）
}

function checkUserHome() {// 检查登录用户主目录
    if (!useHome || !pathExists(useHome)) {
        throw new Error(colors.red("当前登录用户主目录不存在。"))
    }
}

function checkArgs(args) {// 检查输入是开启debug
    if (args.debug) {
        process.env.LOG_LEVEL = "verbose";
    } else {
        process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
}

function checkInputArgs() {// 检查cmd输入
    args = minimist(process.argv.slice(2));
    checkArgs(args);
}

function createDefaultConfig() {// 获取默认环境变量
    const cliConfig = {
        home: useHome,
    }
    if (process.env.CLI_HOME) {
        cliConfig["cliHome"] = path.join(useHome, process.env.CLI_HOME);
    } else {
        cliConfig["cliHome"] = path.join(useHome, DEFAULT_CLI_HOME);
    }
    process.env.HOME_PATH = cliConfig.cliHome;
}

function checkEnv() { // 检查环境变量
    const dotenv = require("dotenv");
    const dotenvPath = path.resolve(homedir(), ".env");
    if (pathExists(dotenvPath)) {
        dotenv.config({path: dotenvPath});
    }
    createDefaultConfig();
    log.verbose("环境变量", process.env.HOME_PATH);
}

async function checkGlobalUpdate() {// 版本号检查
    const currentVersion = pkg.version;
    const pkgName = pkg.name;
    const {getNpmSemverVersions} = require("@puteng-staging/npm-get-info");
    // const versions = await getNpmVersions("puteng-staging");
    // console.log({versions});
    const lastVersion = await getNpmSemverVersions(pkgName);
    if(lastVersion !== undefined && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow("更新提示", `
请手动更新 ${pkgName} ，当前版本${currentVersion}，最新版本${lastVersion}。
更新命令：yarn global add ${pkgName}
`))
    }
}
