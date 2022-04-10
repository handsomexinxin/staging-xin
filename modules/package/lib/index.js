'use strict';
const pkgDir = require("pkg-dir").sync;
const npmInstall = require("npminstall");
const pathExists = require("path-exists").sync;
const fse = require("fs-extra");
const path = require("path");
const {isObject} = require("@puteng-staging/utils");
const formatPath = require("@puteng-staging/format-path");
const {getDefaultRegistry, getLatestVersion} = require("@puteng-staging/npm-get-info");

class Package {
    constructor(options) {
        if (!options) {
            throw new Error("package 类的参数不能为空!");
        }
        if (isObject(options) === false) {
            throw new Error("package 类的参数必须为对象!");
        }
        // package目标路径
        this.targetPath = options.targetPath;
        // package的缓存路径
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
    }

    // 缓存路径获取    @puteng-staging/init ==》_@puteng-staging_init@1.0.7@@puteng-staging
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.packageName.replace("/", "_")}@${this.packageVersion}@${this.packageName}`)
    }
    getSpecificCacheFilePath(version) {
        return path.resolve(this.storeDir, `_${this.packageName.replace("/", "_")}@${version}@${this.packageName}`)
    }

    // 将latest转换为最新的具体版本号
    async prepare() {
        if (this.storeDir && pathExists(this.storeDir) === false) {
            fse.mkdirpSync(this.storeDir);
        }
        if (this.packageVersion === "latest") {
            this.packageVersion = await getLatestVersion(this.packageName);
        }
    }

    // 判断当前package是否存在
    async exists() {
        if (this.storeDir) {
            await this.prepare();
            return pathExists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath);
        }
    }
    // 安装package
    async install() {
        await this.prepare();
        return npmInstall({
            root: this.targetPath,// 安装根目录
            storeDir: this.storeDir,// 缓存目录
            registry: getDefaultRegistry(true),
            pkgs: [
                {name: this.packageName, version: this.packageVersion}
            ]
        })
    }

    // 更新package
    async update() {
        this.prepare()
        // 拿到最新版本号
        const latestVersion = await getLatestVersion(this.packageName);
        const latestFilePath = this.getSpecificCacheFilePath(latestVersion);
        if (pathExists(latestFilePath) === false) {
            await npmInstall({
                root: this.targetPath,// 安装根目录
                storeDir: this.storeDir,// 缓存目录
                registry: getDefaultRegistry(true),
                pkgs: [
                    {name: this.packageName, version: latestVersion}
                ]
            })
            this.packageVersion = latestVersion;
        }
    }

    // 获取入口文件的路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            // 获取package.json 所在目录 pkg-dir
            const dir = pkgDir(targetPath);
            if (dir !== undefined) {
                // 读取package文件  require （）支持js、json、node文件 非这三种当做js解析
                const pkgFile = require(path.resolve(dir, "./package.json"))
                // main/lib path
                if (pkgFile && pkgFile.main !== undefined) {
                    // 路径兼容（macos、windows）
                    return formatPath(path.resolve(dir, pkgFile.main));
                }
            }
            return null;
        }
        if (this.storeDir) {
            return _getRootFile(this.cacheFilePath)
        } else {
            return _getRootFile(this.targetPath);
        }
    }
}

module.exports = Package;
