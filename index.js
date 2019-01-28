const discord = require("discord.js");
const bot = new discord.Client();
module.exports.bot = bot;

const terminal = require("./js/terminal");
const util = require("./js/util.js");

module.exports.SUCCESS_COLOR = 3120179;
module.exports.ERROR_COLOR = 12337730;
var app, cfg, aliases;

var commands = {};

var status = 0; //0 = Offline, 1 = Booting up, 2 = Online, 3 = Shutting Down
module.exports.status = status;

//Load Config and Login
(function () {
    try { 
        cfg = require("./config-override.json");
        console.log("Module config-overide.json found.");
    } catch (err) {
        cfg = require("./config.json");
        console.log("Module config-overide.json not found or loaded, using config.json.");
    }
    module.exports.cfg = cfg;

    for (let i in cfg.commands) {
        if (i == cfg.aboutCommand) commands[cfg.simpleName] = require(cfg.commands[i]);
        else commands[i] = require(cfg.commands[i]);
    }
    module.exports.commands = commands;

    login();
})();

function login() {
    bot.login(cfg.token).then(()=> {
        console.log("Logged In.");
        status = 1;
    }).catch((err) => {
        console.log("Could not login." + err);
        exit();
    });
}

bot.on("ready", () => {
    console.log(cfg.name + " online.");
    bot.user.setActivity(cfg.prefix + cfg.simpleName);

    aliases = cfg['aliases']
    module.exports.aliases = aliases;

    bot.fetchApplication().then((res) => {
        app = res;
        module.exports.app = app;
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
                    "Logging out and logging in again.");
        bot.destroy().then(()=> {
            login();
        }).catch((err)=> {
            exit();
        });
    }
});

bot.on("message", (msg) => {
    if (msg.author.bot|| msg.content[0] != cfg.prefix || msg.system) return;
    parseCommand(msg);
});

function print(msg, content) {
    if (content instanceof discord.RichEmbed || content instanceof discord.Attachment) return msg.channel.send("", content);
    if (content instanceof String) return msg.channel.send(content);
    return msg.channel.send("", new discord.RichEmbed(content));
}

function getPermission(msg, req) {
    if (msg.channel instanceof discord.DMChannel || msg.author.id == app.owner.id) return true;
    return msg.channel.permissionsFor(msg.member).has(req);
}

module.exports.print = print;
module.exports.getPermission = getPermission;

function parseCommand(msg) {
    let args = msg.content.split(cfg.prefix)[1].split(' ');
    args.forEach(parseArgument);
    let command = args.splice(0, 1);

    if (command in aliases) {
        args = aliases[command].split(' ').concat(args);
        command = args.splice(0, 1);
    }
    if (commands[command] == null) return;
    if (!getPermission(msg, commands[command].permissions)) {
        print(msg, {
            "color": ERROR_COLOR,
            "title": "You do not have permission."
        });
        return;
    }
    
    commands[command].execute(msg, args, module.exports);
}

function parseArgument(arg, i, array) {
    array[i] = encodeURI(arg);
}

function exit() {
    status = 3;
    bot.destroy().then(()=> {
        status = 0;
        console.log(cfg.name + " offline.");
        terminal.close();
        process.exit();
    }).catch(()=> {
        status = 2;
        console.log("Cannot log out. Staying online.");
    }); 
}

module.exports.exit = function() {
    console.log("Exiting from outside of main module.");
    exit();
}