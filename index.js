const   discord = require("discord.js");
const   bot = new discord.Client();

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

const aboutCommand = {
    execute: function(msg) {
        print(msg, 
            "Hello! I am " + cfg.name + ".\n" +
            "I run off of midymyth's code here: https://github.com/midymyth/isla-discordbot \n" +
            "Type " + cfg.prefix + "commands to see my commands."
        );
    },
    info: cfg.simpleName + " - Displays information about this bot.",
    permissions: "SEND_MESSAGES"
};

bot.login(cfg.token); //Login

bot.on("ready", () => {
    console.log(cfg.name + " online.");
    bot.user.setActivity(cfg.prefix + cfg.simpleName);

    commands[cfg.simpleName] = aboutCommand;
});

bot.on("disconnect", () => {
    exit();
});

bot.on("message", (msg) => {
    if (msg.author.id == bot.user.id || msg.content[0] != cfg.prefix) return;
    parseCommand(msg);
});

function print(msg, content) {
    msg.channel.send(content);
}

var commands = { //Bot Commands
    "commands": {
        execute: function(msg) {
            var message = cfg.name + "'s Commands: \n";
            Object.keys(commands).forEach(e => {
                message += cfg.prefix + commands[e].info + '\n';
            });
            print(msg, message);
        },
        info: "commands - List all commands for this bot.",
        permissions: "SEND_MESSAGES"
    },
    "permission": {
        execute: function(msg, args) {
            if (!args[0] || !commands[args[0]]) return;
            print(msg, 
                getPermission(msg, commands[args[0]].permissions) 
                ? "You Have Permission." : "You do not have permission."
            );
        },
        info: "permission [command] - Checks to see if you can execute a command.",
        permissions: "SEND_MESSAGES"
    },
    "roll": {
        execute: function(msg, args) {
            if (args[0] == undefined || parseInt(args[0]) <= 0)  args[0] = 6;
            var roll = Math.floor(Math.random() * parseInt(args[0]) + 1).toString();
            print(msg, "Out of " + args[0] + ", **" + roll + "** was rolled.");
        },
        info: "roll [max] - Rolls a dice.",
        permissions: "SEND_MESSAGES"
    }
}

function getPermission(msg, req) {
    if (msg.channel instanceof discord.DMChannel) return true;
    return msg.member.permissions.has(req);
}

function parseCommand(msg) {
    var args = msg.content.split(cfg.prefix)[1].split(' ');
    var command = args[0];
    args.splice(0, 1);
    if (commands[command] != null && getPermission(msg, commands[command].permissions)) {
        commands[command].execute(msg, args);
    }
}

terminal.on("line", (input) => { //Terminal Commands
    input = input.replace("\\n", '\n');
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
    }
});

terminal.on("SIGINT", () => {
    exit();
});

function exit() {
    terminal.close();
    process.exit();
}