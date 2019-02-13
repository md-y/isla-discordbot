module.exports = {
    execute: function(msg, args, index) {
        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "author": {
                "name": index.cfg.name,
                "url": "https://github.com/midymyth/isla-discordbot"
            },
            "thumbnail": {
                "url": index.app.iconURL
            },
            "fields": [
                {
                    "name": "Online Time",
                    "value": (index.bot.uptime/1000).toString() + " seconds"
                },
                {
                    "name": "Online Since",
                    "value": index.bot.readyAt.toDateString()
                },
                {
                    "name": "Joined Servers",
                    "value": index.bot.guilds.size
                },
                {
                    "name": "Joined Channels",
                    "value": index.bot.channels.size
                }
            ]
        });
    },
    syntax: "",
    info: "Displays the stats of this bot",
    permissions: ["SEND_MESSAGES"]
};