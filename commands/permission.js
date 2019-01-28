module.exports = {
    execute: function(msg, args, index) {
        if (!args[0] || !index.commands[args[0]]) return;
        let perms = index.commands[args[0]].permissions;
        let has = index.getPermission(msg, perms);
        index.print(msg, {
            "color": has ? index.SUCCESS_COLOR : index.ERROR_COLOR,
            "title": has ? "You have permission." : "You do not have permission.",
            "description": "Required Permissions: " + perms.join(", ")
        });
    },
    syntax: "permission [command]",
    info: "Checks to see if you can execute a command.",
    permissions: ["SEND_MESSAGES"]
};