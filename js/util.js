const index = require("../index.js");
const https = require("https");

module.exports.parseMarkdown = function(str) {
    const patterns = {
        "[i]": "*",
        "[/i]": "*",
        "[b]": "**",
        "[/b]": "**",
        "&quot;": '"',
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&rsquo;": "'",
        "&lsquo;": "'"
    }

    str = decodeURI(str);

    let oldStr = "";
    while(oldStr != str) {
        oldStr = str;
        for (i of Object.keys(patterns)) str = str.replace(i, patterns[i]);
    }
    return str;
}

module.exports.getHttp = function(url, callback) {
    https.get(url, (res) => {
        let str = "";

        res.on("data", (data) => {
            str += data;
        });

        res.on("end", () => {
            callback(str);
        });
    }).on("error", (err) => {
        callback(err);
    });
}

module.exports.getJSON = function(url, callback) {
    module.exports.getHttp(url, (str)=>{
        if (str[0] != '{' && str[0] != '[') {
            callback([]);
            return;
        }
        callback(JSON.parse(str));
    });
}