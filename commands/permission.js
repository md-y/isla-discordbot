module.exports = {
    execute: function(msg, args, index) {
        const printError = function(index, msg) {
            index.print(msg, {
                "color": index.ERROR_COLOR,
                "title": "Invalid/Unknown command argument."
            });
        }

        if (!args[0]) return printError(index, msg);
        if (index.cfg.aliases[args[0]]) args[0] = index.cfg.aliases[args[0]].split(" ")[0];
        if (!args[0] || !index.commands[args[0]]) return printError(index, msg);

        let perms = index.commands[args[0]].permissions;
        let has = index.getPermission(msg, perms);
        index.print(msg, {
            "color": has ? index.SUCCESS_COLOR : index.ERROR_COLOR,
            "title": has ? "You have permission." : "You do not have permission.",
            "description": "Required Permissions: " + perms.join(", ")
        });
    },
    syntax: "[command]",
    info: "Checks to see if you can execute a command.",
    permissions: ["SEND_MESSAGES"]
};