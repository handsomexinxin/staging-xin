'use strict';
const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const commander = require("commander");
const {homedir} = require("os");
const pathExists = require("path-exists");

const log = require("@puteng-staging/log");
const init = require("@puteng-staging/init");
const exec = require("@puteng-staging/exec");
const pkg = require("../package.json");
const {LOW_NODE_VERSION, DEFAULT_CLI_HOME} = require("./const");
const useHome = homedir()

const program = new commander.Command();
async function core() {
    try {
        await prepare();
        registerCommand();
    } catch (e) {
        log.error(e.message);
        const opts = program.opts();
        if (opts.debug === true) {
            console.log(e);
        }
    }
};
// 初始化脚手架
function registerCommand() {
    program
        .name("@puteng-staging")
        .usage("<command> [options]")
        .version(pkg.version)
        .option("-d --debug", "是否开启debug模式", false)
        .option("-tp --targetPath <targetPath>", "是否指定本地调试文件路径");

    program
        .command("init [projectName]")
        .option("-f --force", "是否强制初始化项目", false)
        .action(exec);

    const opts = program.opts();

    program.on("option:targetPath", function () {
        if (opts.targetPath) {
            process.env.CLI_TARGET_PATH = opts.targetPath;
        }
    });

    // 开启debug模式
    program.on("option:debug", function () {
        if (opts.debug === true) {
            process.env.LOG_LEVEL = "verbose";
        } else {
            process.env.LOG_LEVEL = "verbose";
        }
        log.level = process.env.LOG_LEVEL;
    });
    // 对未知命令监听
    program.on("command:*", function (obj) {
        log.error(colors.red(`未知的命令：${obj[0]}`))
        const availableCommands = program.commands.map(cmd => cmd.name());
        if (availableCommands.length > 0) {
            log.info(colors.green(`可用命令: ${availableCommands.join(", ")}`))
        }
    });

    program.parse(process.argv);
}

async function prepare() {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv();
    await checkGlobalUpdate();
}

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

function createDefaultConfig() {// 获取默认环境变量
    const cliConfig = {
        home: useHome,
    }
    if (process.env.CLI_HOME) {
        cliConfig["cliHome"] = path.join(useHome, process.env.CLI_HOME);
    } else {
        cliConfig["cliHome"] = path.join(useHome, DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkEnv() { // 检查环境变量
    const dotenv = require("dotenv");
    const dotenvPath = path.resolve(homedir(), ".env");
    if (pathExists(dotenvPath)) {
        dotenv.config({path: dotenvPath});
    }
    createDefaultConfig();
    log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

async function checkGlobalUpdate() {// 版本号检查
    const currentVersion = pkg.version;
    const pkgName = pkg.name;
    const {getNpmSemverVersions} = require("@puteng-staging/npm-get-info");
    const lastVersion = await getNpmSemverVersions(pkgName);
    if (lastVersion !== undefined && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow("更新提示", `
请手动更新 ${pkgName} ，当前版本${currentVersion}，最新版本${lastVersion}。
更新命令：yarn global add ${pkgName}
`))
    }
}

module.exports = core;
