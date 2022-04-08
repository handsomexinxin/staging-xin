'use strict';
const pkgDir = require("pkg-dir").sync;
const path = require("path");
const {isObject} = require("@puteng-staging/utils");
const formatPath = require("@puteng-staging/format-path");

class Package {
    constructor(options) {
        if(!options) {
            throw new Error("package 类的参数不能为空!");
        }
        if(isObject(options) === false) {
            throw new Error("package 类的参数必须为对象!");
        }
        // package目标路径
        this.targetPath = options.targetPath;
        // // package的缓存路径
        // this.storePath = options.storePath;
        // package的name
        this.packageName = options.packageName;
         // package的version
         this.packageVersion = options.packageVersion;
    }
    // 判断当前package是否存在
    exists() {

    }
    // 安装package
    install() { }

    // 更新package
    update() { }

    // 获取入口文件的路径
    getRootFilePath() {
        // 获取package.json 所在目录 pkg-dir
        console.log(this.targetPath);
        const dir = pkgDir(this.targetPath);
        if(dir !== undefined) {
            // 读取package文件  require （）支持js、json、node文件 非这三种当做js解析
            const pkgFile = require(path.resolve(dir, "./package.json"))
            // main/lib path
            if(pkgFile && pkgFile.main !== undefined) {
                // 路径兼容（macos、windows）
                return formatPath(path.resolve(dir, pkgFile.main));
            }
        }
        return null;
    }
}

module.exports = Package;