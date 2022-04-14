'use strict';
const semver = require("semver");
const colors = require("colors");
const log = require("@puteng-staging/log")
// const {isObject} = require("@puteng-staging/utils")
const LOW_NODE_VERSION = "12.0.0";

class Command {
    constructor(argv) {
        // log.verbose("command constructor");
        this._argv = argv;
        if(argv === undefined) {
            throw new Error("参数不能为空");
        }
        if(Array.isArray(argv) === false) {
            throw new Error("参数必须为对象");
        }
        if(argv.length < 1) {
            throw new Error("参数列表为空");
        }
        let runner = new Promise((res, rej) => {
            let chain = Promise.resolve();
            chain = chain.then(() => this.checkNodeVersion());
            chain = chain.then(() => this.initArgs());
            chain = chain.then(() => this.init());
            chain = chain.then(() => this.exec());
            chain.catch(err => {log.error(err.message)});
        })
    }

    checkNodeVersion() {// 检查node版本
        const currentVersion = process.version;
        if (semver.gte(LOW_NODE_VERSION, currentVersion)) {
            throw new Error(colors.red(`puteng-staging 需要安装 ${LOW_NODE_VERSION} 以上版本的 Node.js`))
        }
        log.info(process.version);
    }

    initArgs() {
        this._cmd = this._argv[this._argv.length - 1];
        this._argv = this._argv.slice(0, this._argv.length - 1);
    }

    init() {
        throw new Error("init 必须实现 ")
    }

    exec() {
        throw new Error("exec 必须实现 ")
    }
}


module.exports = Command;
