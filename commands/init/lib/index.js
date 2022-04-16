'use strict';
const Command = require("@puteng-staging/command");
const fs = require("fs");
const path = require("path");
const userHome = require("user-home");
const fse = require("fs-extra");
const semver = require("semver");
const inquirer = require("inquirer");
const log = require("@puteng-staging/log");
const Package = require("@puteng-staging/package");
const {spinnerStart, sleep} = require("@puteng-staging/utils");
const getProjectTemplate = require("./getProjectTemplate");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || "";
        this.force = this._argv[1].force;
        log.verbose("init projectName", this.projectName)
        log.verbose("init force", this.force)
    }
    async exec() {
        try {
            const projectInfo = await this.prepare()
            this.projectInfo = projectInfo;
            if (projectInfo !== undefined) {
                await this.downloadTemplate();
            }
        } catch (e) {
            console.log(e);
        }
        // console.log("init 工作逻辑");
    }

    async downloadTemplate() {
        const {projectTemplate} = this.projectInfo;
        const templateInfo = this.template.find(item => item.npmName === projectTemplate)
        // log.verbose(projectTemplate, userHome);
        const targetPath = path.resolve(userHome, ".puteng-staging-dev", "template")
        const storeDir = path.resolve(userHome, ".puteng-staging-dev", "template", "node_modules")
        const {version, npmName} = templateInfo;
        // console.log(targetPath, storeDir);
        const templateNpm = new Package({
            packageName: npmName,
            packageVersion: version,
            storeDir,
            targetPath
        });
        if (! await templateNpm.exists()) {
            const spinner = spinnerStart(`正在安装${npmName}...`);
            try {
                await templateNpm.install();
                log.success("下载模板成功")
                await sleep();
            } catch (error) {
                throw error;
            } finally {
                spinner.stop(true);
            }
        } else {
            const spinner = spinnerStart(`正在更新${npmName}...`);
            try {
                await templateNpm.update();
                log.success("更新模板成功");
                await sleep();
            } catch (error) {
                throw error;
            } finally {
                spinner.stop(true);
            }
        }
        // 1、通过项目模板API获取项目模板信息
        // 1.1 通过 egg.js 搭建一套后端系统
        // 1.2、通过npm存储项目模板
        // 1.3、将项目模板信息存储到 mongodb 数据库中
        // 1.4、通过 egg.js 获取 mongodb 中的数据并且通过 API 返回
    }

    async prepare() {
        const template = await getProjectTemplate();
        if (!template || template.length === 0) {
            throw new Error("项目模板不存在");
        }
        this.template = template
        // throw new Error("出错了")
        // 判断当前目录是否为空
        const localPath = process.cwd();
        const ret = this.isDirEmpty(localPath)
        if (ret === false) {
            let ifContinue = false;
            if (this.force !== true) {
                ifContinue = (await inquirer.prompt({
                    type: "confirm",
                    name: "ifContinue",
                    message: `当前文件夹不为空是否继续创建？`,
                    default: false
                })).ifContinue;
                if (ifContinue === false) {
                    return;
                }
            }
            if (ifContinue === true || this.force === true) {
                // 二次确认
                // 是否启动强制更新
                const {confirmDelete} = await inquirer.prompt({
                    type: "confirm",
                    name: "confirmDelete",
                    message: `是否清空当前目录下的文件？(这会清空你的当前文件夹: ${localPath})`,
                    default: false
                });
                if (confirmDelete === true) {
                    fse.emptyDirSync(localPath)
                }
            }
        }
        // 选择创建项目或组件
        // 获取项目基本信息
        return this.getProjectInfo()
    }

    async getProjectInfo() {
        // 选择创建项目或组件
        // const projectInfo = {};
        const type = (await inquirer.prompt({
            type: "list",
            name: "type",
            message: "请选择初始化类型",
            default: TYPE_PROJECT,
            choices: [
                {name: "项目", value: TYPE_PROJECT},
                {name: "组件", value: TYPE_COMPONENT},
            ]
        })).type
        // 获取项目基本信息
        if (type === TYPE_PROJECT) {
            const project = await inquirer.prompt([
                {
                    type: "input",
                    name: "projectName",
                    message: "请输入项目名称",
                    // default: "",
                    validate(v) {
                        var done = this.async();
                        // 1、首字母必须为英文字母
                        // 2、尾字符必须为英文或数字，不能为字符
                        // 3、字符仅允许—_ [\w-]*[a-zA-Z0-9]
                        if (/^[a-zA-Z]+([-_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v) === false) {
                            done(`请输入合法的项目名称：
1、首字母必须为英文字母；
2、尾字符必须为英文或数字，不能为字符；
3、字符仅允许—_；
4、_-字符之后必须为字母；
                                `);
                            return;
                        }
                        done(null, true);
                    },
                    filter(v) {
                        return v
                    }
                },
                {
                    type: "input",
                    name: "projectVersion",
                    message: "请输入项目版本号",
                    default: "1.0.0",
                    validate(v) {
                        var done = this.async();
                        if (!semver.valid(v)) {
                            done("输请输入合法的版本号。")
                            return;
                        }
                        done(null, true);
                    },
                    filter(v) {
                        if (!!semver.valid(v)) {
                            return semver.valid(v);
                        }
                        return v;
                    }
                },
                {
                    type: "list",
                    name: "projectTemplate",
                    message: "请选择项目模板",
                    choices: this.createTemplateChoices()
                }
            ])
            return {
                ...project,
                type
            }
        } else if (type === TYPE_COMPONENT) {

        }
        // return projectInfo
    }

    createTemplateChoices() {
        return this.template.map(item => ({value: item.npmName, name: item.name}))
    }

    isDirEmpty(localPath) {
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
