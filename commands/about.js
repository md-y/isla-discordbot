const index =  require("../index.js") // Require only because of syntax property

module.exports = {
    execute: function(msg) {
        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "description":
            "Hello! I am " + index.cfg.name + ".\n" +
            "I run off of m;dy's code here: https://github.com/md-y/isla-discordbot \n" +
            "Type " + index.cfg.prefix + "commands to see my commands."
        });
    },
    syntax: index.cfg.simpleName,
    info: "Displays information about this bot.",
    permissions: ["SEND_MESSAGES"]
};