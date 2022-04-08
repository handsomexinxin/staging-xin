'use strict';
const path = require("path");

module.exports =function formatPath(p) {
    if(p !== null && typeof p === "string") {
        const sep = path.sep;// 系统分隔符  mac: / window: \
        if(sep == "/") {
            return p;
        }
        return p.replace(/\\/g, "/")
    }
    return p;
}
