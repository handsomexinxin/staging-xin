'use strict';
const Command = require("@puteng-staging/command");
const fs = require("fs");
const log = require("@puteng-staging/log");


class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || "";
        this.force = this._argv[1].force;
        log.verbose("initCommand.projectName", this.projectName)
        log.verbose("initCommand.force", this.force)
    }
    exec() {
        try {
            this.prepare()
        } catch (e) {
            console.log(e);
        }
        // console.log("init 工作逻辑");
    }
    prepare() {
        // throw new Error("出错了")
        // 判断当前目录是否为空
        const ret = this.isCwdEmpty()
        // 是否启动强制更新
        // 选择创建项目或组件
        // 获取项目基本信息
    }
    isCwdEmpty() {
        const localPath = process.cwd();
        const fileList = fs.readdirSync(localPath).filter(file => file.startsWith(".") === false && ["node_modules"].indexOf(file) === -1);
        return fileList.length === 0;
    }
}
function init(argv) {
    // console.log("init", projectName, cmdObj.force, process.env.CLI_TARGET_PATH);
    return new InitCommand(argv)
}


module.exports = init;
module.exports.InitCommand = InitCommand;
