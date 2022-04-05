'use strict';
const axios = require("axios").default;
const urlJoin = require("url-join");
const semver = require("semver");

function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? "https://registry.npmjs.org" : "https://registry.npmmirror.com"
}
function getNpmInfo(npmName, registry) {
    //https://registry.npmmirror.com/xx or https://registry.npmjs.org/xx
    if (!npmName) {
        return null;
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName);
    return axios.get(npmInfoUrl).then(res => {
        if (res.status === 200) {
            return res.data;
        }
        return null;
    }).catch(err => Promise.reject(err));
}

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions);
    }
    return [];
}

async function getNpmSemverVersions(npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions= versions.sort((a, b) => semver.gt(b, a) ? 1: -1);;
    if(newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
    return undefined;
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersions
};
