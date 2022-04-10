'use strict';

const path = require("path");
const Package = require("@puteng-staging/package");
const log = require("@puteng-staging/log");
const cp = require("child_process");

const SETTINGS = {
    init: "@puteng-staging/init"
}
const CACHE_DIR = "dependencies"

async function exec() {
    let pkg;
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = ""
    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = "latest";
    if (targetPath === undefined) {
        targetPath = path.resolve(homePath, CACHE_DIR)// 缓存路径
        storeDir = path.resolve(targetPath, "node_modules")
        log.verbose("targetPath", targetPath)
        log.verbose("storeDir", storeDir)
        pkg = new Package({targetPath, homePath, packageName, packageVersion, storeDir})
        if (await pkg.exists()) {
            // 存在则更新package
            await pkg.update();
        } else {
            // 安装package
            await pkg.install();
        }
        // console.log("pkg.getRootFilePath()", pkg.getRootFilePath());
    } else {
        pkg = new Package({targetPath, packageName, packageVersion})
    }
    log.verbose("init文件路径", pkg.getRootFilePath());
    const rootFile = pkg.getRootFilePath();
    try {
        const args = Array.from(arguments);
        const cmd = args[args.length - 1];
        const o = Object.create(null);
        Object.keys(cmd).forEach((key) => {
            if (cmd.hasOwnProperty && key.startsWith("_") === false && key !== "parent") {
                o[key] = cmd[key]
            }
        })
        args[args.length - 1] = o;
        const code = `require("${rootFile}").call(null, ${JSON.stringify(args)})`;
        const child = spawn("node", ["-e", code], {
            cwd: process.cwd(),
            stdio: "inherit"
        })
        child.on("error", (e) => {
            log.error(e.message)
            process.exit(1)
        })
        child.on("exit", (e) => {
            log.verbose("命令执行成功", e)
        })

    } catch (e) {
        log.error(e.message);
    }
    // console.log(pkg.getRootFilePath());
}
//兼容
function spawn(command, args, options) {
    const win32 = process.platform === "win32";
    const cmd = win32 ? "cmd" : command;
    const cmdArgs = win32 ? ["/c"].concat(command, args): args;
    return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
