const discord = require("discord.js");
const bot = new discord.Client();
var app;

const https = require("https");

const readline = require("readline");
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        print(msg, 
            "Hello! I am " + cfg.name + ".\n" +
            "I run off of midymyth's code here: https://github.com/midymyth/isla-discordbot \n" +
            "Type " + cfg.prefix + "commands to see my commands."
        );
    },
    info: '*' + cfg.simpleName + "* - Displays information about this bot.",
    permissions: "SEND_MESSAGES"
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
    return msg.channel.send(content);
}

var commands = { //Bot Commands
    "commands": {
        execute: function(msg) {
            let message = cfg.name + "'s Commands: \n";
            Object.keys(commands).forEach(e => {
                message += cfg.prefix + commands[e].info + '\n';
            });
            print(msg, message);
        },
        info: "*commands* - List all commands for this bot.",
        permissions: ["SEND_MESSAGES"]
    },
    "permission": {
        execute: function(msg, args) {
            if (!args[0] || !commands[args[0]]) return;
            print(msg, 
                getPermission(msg, commands[args[0]].permissions) 
                ? "You have permission." : "You do not have permission."
            );
        },
        info: "*permission [command]* - Checks to see if you can execute a command.",
        permissions: ["SEND_MESSAGES"]
    },
    "roll": {
        execute: function(msg, args) {
            if (args[0] == undefined || parseInt(args[0]) <= 0)  args[0] = 6;
            let roll = Math.floor(Math.random() * parseInt(args[0]) + 1).toString();
            print(msg, "Out of " + args[0] + ", **" + roll + "** was rolled.");
        },
        info: "*roll [max]* - Rolls a dice.",
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
                    print(msg, "No image was found.");
                    channel.stopTyping();
                } else {
                    let img = res[0].hasOwnProperty("file_url") ? res[0]["file_url"] : res[0]["source"];
                    print(msg, {files: [img]})
                    .then( () => {
                        channel.stopTyping();
                    })
                    .catch( (e) => {
                        print(msg, img)
                        .then( () => {
                            channel.stopTyping();
                        })
                        .catch( (err) => {
                            console.log(e);
                        });
                    });
                }
            });
        },
        info: "*db [tag] [nsfw?]* - Retrieves an image from Danbooru.",
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
    var args = input.trim().split(' ');

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
            var channel = bot.channels.get(args[1]);
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