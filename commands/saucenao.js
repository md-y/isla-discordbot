const util = require("../js/util.js");

module.exports = {
    execute: function(msg, args, index) {
        if (!index.cfg.settings.saucenao) {
            index.print(msg, {
                "color": index.ERROR_COLOR,
                "title": "No API Key for this command. Please contact admin."
            });
            return;
        }

        const api = "https://saucenao.com/search.php?&output_type=2?dbmask=999&numres=1&api_key=" + index.cfg.settings.saucenao + "&url=";
        let url = "";

        // Get URL
        if (args.length >= 1) {
            url = args[0];
        } else {
            let lastMessage = msg.channel.messages.last(2)[0]; // Ignore command execution message
            if (lastMessage.embeds.length > 0 && lastMessage.embeds[0].image && lastMessage.embeds[0].image.url) {
                url = lastMessage.embeds[0].image.url; // Embeded Image
            } else if (lastMessage.attachments.size > 0) {
                url = lastMessage.attachments.first().url; // Attachment
            } else { 
                // Error
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "title": "No source image provided."
                });
                return;
            }
        }

        url = encodeURIComponent(url);
        util.getJSON(api + url, (res)=>{
            if (!res.results || res.results.length == 0) { // Fail
                let error = "Failed to find image.";
                if (res.header && res.header.message) error = res.header.message; // Server error message
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "title": error
                });
            } else { // Success
                let obj = res.results[0];
                let payload = {
                    "title": `${(obj.data.title ? obj.data.title : "Unknown Image")} (${obj.header.similarity}% Similarity)`,
                    "color": index.SUCCESS_COLOR,
                    "description": obj.data.ext_urls.join("\n"),
                    "footer": {
                        "text": obj.header.index_name
                    },
                    "author": {
                      "name": "Unknown Artist" // Place holder unless no artist
                    },
                    "image": {
                        "url": encodeURI(obj.header.thumbnail)
                    },
                    "fields": []
                };
                
                //Search for Data
                for (i of ["member_name", "author_name", "creator", "source", "pawoo_user_display_name"]) {
                    if (obj.data[i]) payload.author.name = obj.data[i];
                }

                for (i of ["Characters", "Material", "Part", "Year"]) {
                    if (obj.data[i.toLowerCase()]) payload.fields.push({"name": i, "value": obj.data[i.toLowerCase()], "inline": true})
                }

                if (obj.data.author_url) payload.author.url = obj.data.author_url;

                index.print(msg, payload);
            }
        });
    },
    syntax: "(url)",
    info: "Searches SauceNAO with a specified url or the previous message's image.",
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
};