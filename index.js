const discord = require("discord.js");
const bot = new discord.Client();
var app;

const https = require("https");

const readline = require("readline");
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SUCCESS_COLOR = 3120179;
const ERROR_COLOR = 12337730;

var cfg;
try { //Load Config
    cfg = require("./config-override.json");
    console.log("Module config-overide.json found.");
} catch (err) {
    cfg = require("./config.json");
    console.log("Module config-overide.json not found or loaded, using config.json.");
}

var status = 0; //0 = Offline, 1 = Booting up, 2 = Online, 3 = Shutting Down

const aboutCommand = {
    execute: function(msg) {
        print(msg, new discord.RichEmbed({
            "color": SUCCESS_COLOR,
            "description":
            "Hello! I am " + cfg.name + ".\n" +
            "I run off of midymyth's code here: https://github.com/midymyth/isla-discordbot \n" +
            "Type " + cfg.prefix + "commands to see my commands."
        }));
    },
    syntax: cfg.simpleName,
    info: "Displays information about this bot.",
    permissions: ["SEND_MESSAGES"]
};

function login() {
    bot.login(cfg.token).then(()=> {
        status = 1;
    }).catch((err) => {
        console.log("Could not login." + err);
        exit();
    });
}
login();


bot.on("ready", () => {
    console.log(cfg.name + " online.");
    bot.user.setActivity(cfg.prefix + cfg.simpleName);

    commands[cfg.simpleName] = aboutCommand;

    bot.fetchApplication().then((res) => {
        app = res;
        console.log(cfg.name + " is ready to use!");
        status = 2;
    }).catch((err)=>{
        console.log("Could not grab app info." + err);
        exit();
    });
});

bot.on("disconnect", (event) => {
    if (status == 3 || status == 0) {
        console.log("Disconnected with code " + event.code);
        exit();
    } else {
        console.log("Bot attempted disconnection, but has been told to stay online. (Status Code: " + status + ") " + 
                    "Logging in again.");
        bot.destroy().then(()=> {
            login();
        }).catch((err)=> {
            exit();
        });
    }
});

bot.on("message", (msg) => {
    if (msg.author.id == bot.user.id || msg.content[0] != cfg.prefix || msg.system) return;
    parseCommand(msg);
});

function print(msg, content) {
    if (content instanceof discord.RichEmbed || content instanceof discord.Attachment) return msg.channel.send("", content);
    return msg.channel.send(content);
}

var commands = { //Bot Commands
    "commands": {
        execute: function(msg) {
            let fields = new Array();
            Object.keys(commands).forEach(e => {
                fields.push({
                    "name": cfg.prefix + commands[e].syntax,
                    "value": commands[e].info
                })
            });
            print(msg, new discord.RichEmbed({
                "color": SUCCESS_COLOR,
                "title": cfg.name + "'s Commands: \n",
                "fields": fields
            }));
        },
        syntax: "commands",
        info: "List all commands for this bot.",
        permissions: ["SEND_MESSAGES"]
    },
    "permission": {
        execute: function(msg, args) {
            if (!args[0] || !commands[args[0]]) return;
            let perms = commands[args[0]].permissions;
            let has = getPermission(msg, perms);
            print(msg, new discord.RichEmbed({
                "color": has ? SUCCESS_COLOR : ERROR_COLOR,
                "title": has ? "You have permission." : "You do not have permission.",
                "description": "Required Permissions: " + perms.join(", ")
            }));
        },
        syntax: "permission [command]",
        info: "Checks to see if you can execute a command.",
        permissions: ["SEND_MESSAGES"]
    },
    "roll": {
        execute: function(msg, args) {
            if (args[0] == undefined)  args[0] = "1d20";
            const regex = /(\d+|)d?(\d+|)\+?(\d+|)/i;
            let parts = regex.exec(args[0]);
            parts.splice(0, 1);
            
            if (parts[0] != '' && parts[1] == '') {
                parts[1] = parts[0];
                parts[0] = 1;
            } 
            if (parts[0] == '') parts[0] = 1;
            if (parts[1] == '') parts[1] = 20;
            if (parts[2] == '') parts[2] = 0;

            for (let i = 0; i < parts.length; i++) {
                if (!(parts[i] instanceof Number)) parts[i] = parseInt(parts[i]);
                if (parts[i] > 100) parts[i] = 100;
            }

            let rolls = new Array();
            for (let i = 0; i < parts[0]; i++) rolls[i] = Math.floor(Math.random() * parts[1] + 1);
            let roll = parts[0] + 'd' + parts[1] + '+' + parts[2];

            let sum = 0;
            for (i of rolls) sum += i;
            sum += parts[2];

            print(msg, new discord.RichEmbed({
                "color": SUCCESS_COLOR,
                "title": roll,
                "description": '*' + rolls.join('*\n*') + '*',
                "fields": [
                    {
                        "name": "Final Value: (+" + parts[2] + ')',
                        "value": "**" + sum.toString() + "**"
                    }
                ]
            }));
        },
        syntax: "roll [dice notation]",
        info: "Rolls a dice.",
        permissions: ["SEND_MESSAGES"]
    },
    "db": {
        execute: function(msg, args) {
            if (args[0] == undefined) return;
            let api = "https://danbooru.donmai.us/posts.json?utf8=%E2%9C%93&limit=1&random=true&tags=" + args[0] + '+';
            api += (args[1] == "true" || args[1] == "yes" || args[1] == "nsfw" || args[1] == "hentai") ? "rating:e" : "rating:s";
            let channel = msg.channel;

            channel.startTyping();
            getJSON(api, (res) => {
                if (res.length == 0 || res.success == false) {
                    print(msg, new discord.RichEmbed({
                        "color": ERROR_COLOR,
                        "title": "No Image Found."
                    }));
                } else {
                    let post = res[0];
                    let img = post.hasOwnProperty("file_url") ? post["file_url"] : post["source"];
                    print(msg, new discord.RichEmbed({
                        "title": post["tag_string_artist"],
                        "url": "https://danbooru.donmai.us/posts/" + post["id"],
                        "color": SUCCESS_COLOR,
                        "footer": {
                            "text": (post["rating"] == 's' ? "Safe For Work" : "Not Safe For Work")
                        },
                        "timestamp": post["updated_at"],
                        "author": {
                          "name": "Danbooru"
                        },
                        "image": {
                            "url": img
                        }
                    }));
                }
                channel.stopTyping();
            });
        },
        syntax: "db [tag] [nsfw?]",
        info: "Retrieves an image from Danbooru.",
        permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
    }
}

function getPermission(msg, req) {
    if (msg.channel instanceof discord.DMChannel || msg.author.id == app.owner.id) return true;
    return msg.member.permissions.has(req);
}

function parseCommand(msg) {
    let args = msg.content.split(cfg.prefix)[1].split(' ');
    args.forEach(parseArgument);
    let command = args[0];
    args.splice(0, 1);
    if (commands[command] != null && getPermission(msg, commands[command].permissions)) {
        commands[command].execute(msg, args);
    }
}

function parseArgument(arg, i, array) {
    array[i] = encodeURI(arg);
}

function getJSON(url, callback) {
    https.get(url, (res) => {
        let str = "";

        res.on("data", (data) => {
            str += data;
        });

        res.on("end", () => {
            if (str[0] != '{' && str[0] != '[') callback([]);
            callback(JSON.parse(str));
        });
    }).on("error", (err) => {
        callback(err);
    });
}

terminal.on("line", (input) => { //Terminal Commands
    let args = input.trim().split(' ');

    switch(args[0]) {
        default:
            console.log("Unkown Command");
            break;
        case "exit":
        case "end":
        case "kill":
        case "stop":
            exit();
            break;
        case "print":
        case "say":
        case "echo":
            if (args[1] == undefined) break;
            let channel = bot.channels.get(args[1]);
            args.splice(0, 2);
            channel.send(args.join(' '));
            break;
        case "debug":
            console.log(bot);
            break;
        case "config":
            console.log(cfg);
            break;
        case "meta":
        case "app":
        case "oauth2":
            console.log(app);
            break;
        case "status":
            switch (status) {
                case 0:
                    console.log("Offline");
                    break;
                case 1:
                    console.log("Booting Up");
                    break;
                case 2:
                    console.log("Online");
                    break;
                case 3:
                    console.log("Shutting Down");
                    break;
            }
            break;
    }
});

terminal.on("SIGINT", () => {
    exit();
});

process.on('unhandledRejection', (reason) => {
    console.log(reason);
    exit();
});

function exit() {
    status = 3;
    bot.destroy().then(()=> {
        console.log(cfg.name + " offline.");
        terminal.close();
        process.exit();
    }).catch(()=> {
        console.log("Cannot log out.");
    }); 
}