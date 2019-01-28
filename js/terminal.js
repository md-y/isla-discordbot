const index = require("../index.js");
const readline = require("readline");
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
            index.exit();
            break;
        case "print":
        case "say":
        case "echo":
            if (args[1] == undefined) break;
            let channel = index.bot.channels.get(args[1]);
            args.splice(0, 2);
            channel.send(args.join(' '));
            break;
        case "debug":
            console.log(index.bot);
            break;
        case "config":
            console.log(index.cfg);
            break;
        case "meta":
        case "app":
        case "oauth2":
            console.log(index.app);
            break;
        case "status":
            switch (index.status) {
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
    index.exit();
});

process.on('unhandledRejection', (reason) => {
    console.log(reason);
    index.exit();
});

module.exports.close = function() {
    terminal.close();
};