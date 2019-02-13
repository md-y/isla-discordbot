const util = require("../js/util.js");

module.exports = {
    execute: function(msg, args, index) {
        const api = "https://xkcd.com/";
        const suffix = "info.0.json";

        let request = api;
        if (args[0] == undefined) request += suffix;
        else request += args[0] + "/" + suffix;

        const explainApi = "https://www.explainxkcd.com/wiki/index.php/";

        util.getJSON(request, (res)=>{
            if (res.length == 0) {
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "title": "Unknown Comic"
                });
            } else {
                index.print(msg, {
                    "title": res["safe_title"],
                    "url": api + res["num"],
                    "color": index.SUCCESS_COLOR,
                    "description": res["alt"] + "\n\n[Explanation](" + explainApi + res["num"] + ")",
                    "timestamp": (new Date(parseInt(res["year"]), parseInt(res["month"]) - 1, parseInt(res["day"]))).toISOString(),
                    "author": {
                      "name": "xkcd",
                      'url': "https://xkcd.com/"
                    },
                    "image": {
                        "url": res["img"]
                    }
                });
            }
        });
    },
    syntax: "(number)",
    info: "Retrieves a XKCD comic.",
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
};