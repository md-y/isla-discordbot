module.exports = {
    execute: function(msg, args, index) {
        const DEFAULT_COUNT = 10;

        if (!msg.channel.manageable) {
            index.print(msg, {
                "color": index.ERROR_COLOR,
                "title": "I do not have permission or this is a DM."
            });
            return;
        }

        if (args.length == 0 || !args[0] || isNaN(args[0])) args[0] = DEFAULT_COUNT;
        else args[0] = parseInt(args[0]);

        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "title": "Deleting messages..."
        }).finally(() => {
            msg.channel.bulkDelete(args[0], true).then((messages) => {
                index.print(msg, {
                    "color": index.SUCCESS_COLOR,
                    "title": "Deleted " + messages.size + " messages."
                });
            }).catch((err)=>{
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "title": err
                });
            });
        });
        
    },
    syntax: "(number)",
    info: "Deletes a certain number of messages less than two weeks old.",
    permissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"]
};