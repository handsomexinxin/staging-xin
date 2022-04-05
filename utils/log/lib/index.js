'use strict';
const log = require("npmlog");
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";// 判断debug模式
log.heading = "@putong-staging";// 修改前缀
log.headingStyle = {fg: "black", bg: "white"};//修改自定义前缀样式

log.addLevel("success", 2000, {fg: "green", bold: true});

module.exports = log;
