module.exports = {
    execute: function(msg, args, index) {
        let fields = new Array();
        let commands = index.commands;
        Object.keys(commands).forEach(e => {
            fields.push({
                "name": index.cfg.prefix + commands[e].syntax,
                "value": commands[e].info
            });
        });
        Object.keys(index.aliases).forEach(e => {
            fields.push({
                "name": index.cfg.prefix + e + "  *(Alias)*",
                "value": index.cfg.prefix + index.aliases[e]
            });
        });
        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "title": index.cfg.name + "'s Commands: \n",
            "fields": fields
        });
    },
    syntax: "commands",
    info: "List all commands for this bot.",
    permissions: ["SEND_MESSAGES"]
};