'use strict';
const Command = require("@puteng-staging/command");
const log = require("@puteng-staging/log");


class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || "";
        this.force = this._argv[1].force;
        log.verbose("initCommand.projectName", this.projectName)
        log.verbose("initCommand.force", this.force)
    }
    exec() {
        console.log("init 工作逻辑");
    }
}
function init(argv) {
    // console.log("init", projectName, cmdObj.force, process.env.CLI_TARGET_PATH);
    return new InitCommand(argv)
}


module.exports = init;
module.exports.InitCommand = InitCommand;
