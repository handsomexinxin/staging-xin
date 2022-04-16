'use strict';

function isObject(o) {
    return Object.prototype.toString.call(o) === "[object Object]"
}

function spinnerStart(msg = "loading...") {
    var Spinner = require('cli-spinner').Spinner;
    var spinner = new Spinner(`${msg} %s`);
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    return spinner;
}

async function sleep(timeout = 1000) {
    return await new Promise(res => setTimeout(() => res(), timeout))
}

module.exports = {
    isObject,
    spinnerStart,
    sleep
};
