const util = require("../js/util.js");

module.exports = {
    execute: function(msg, args, index) {
        const api = "https://yesno.wtf/api";

        if (args[0] == undefined) args[0] = "";
        else args[0] = "`" + args.join(" ") + "`";

        util.getJSON(api, (res)=>{
            if (res.length == 0) {
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "tile": "Cannot Access API"
                });
            } else {
                index.print(msg, {
                    "color": index.SUCCESS_COLOR,
                    "author": {
                        "name": "yesno.wtf",
                        "url": "https://yesno.wtf/"
                    },
                    "title": args[0] + " **" + res["answer"].toUpperCase() + "**",
                    "image": {
                        "url": res["image"]
                    }
                })
            }
        });
    },
    syntax: "(question)",
    info: "Answers your boolean questions (Yes or No).",
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
};