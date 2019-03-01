module.exports = {
    execute: function(msg, args, index) {
        let content = msg.content.split(" ").slice(1).join(" ");
        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "description": content
        });
    },
    syntax: "[message]",
    info: "Repeats a message.",
    permissions: ["SEND_MESSAGES"]
};