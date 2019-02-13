const discord = require("discord.js");

module.exports = {
    execute: function(msg, args, index) {
        let fields = new Array();
        let commands = index.commands;

        // Add regular commands
        Object.keys(commands).forEach(e => { 
            fields.push({
                "name": index.cfg.prefix + e + " " + commands[e].syntax,
                "value": commands[e].info
            });
        });

        // Add aliases
        Object.keys(index.aliases).forEach(e => {
            fields.push({
                "name": index.cfg.prefix + e + "  *(Alias)*",
                "value": index.cfg.prefix + index.aliases[e]
            });
        });

        // Send DM
        msg.author.send("", new discord.RichEmbed({
            "color": index.SUCCESS_COLOR,
            "title": index.cfg.name + "'s Commands: \n",
            "fields": fields
        }));

        // Notify author in guild
        if (msg.channel.type != "dm") {
            index.print(msg, {
                "color": index.SUCCESS_COLOR,
                "title": "Command List Sent to DM",
                "description": "<@" + msg.author.id + ">"
            });
        }
    },
    syntax: "",
    info: "List all commands for this bot.",
    permissions: ["SEND_MESSAGES"]
};