module.exports = {
    execute: function(msg, args, index) {
        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "description":
            "Hello! I am " + index.cfg.name + ".\n" +
            "I run off of <@277944988925689856>'s code here: https://github.com/md-y/isla-discordbot \n" +
            "Type " + index.cfg.prefix + "commands to see my commands."
        });
    },
    syntax: "",
    info: "Displays information about this bot.",
    permissions: ["SEND_MESSAGES"]
};