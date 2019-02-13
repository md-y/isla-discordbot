module.exports = {
    execute: function(msg, args, index) {
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

        index.print(msg, {
            "color": index.SUCCESS_COLOR,
            "title": roll,
            "description": '*' + rolls.join('*\n*') + '*',
            "fields": [
                {
                    "name": "Final Value: (+" + parts[2] + ')',
                    "value": "**" + sum.toString() + "**"
                }
            ]
        });
    },
    syntax: "(dice notation)",
    info: "Rolls a dice.",
    permissions: ["SEND_MESSAGES"]
}