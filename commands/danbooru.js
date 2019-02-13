const util = require("../js/util.js");

module.exports = {
    execute: function(msg, args, index) {
        if (args[0] == undefined) args[0] = "";
        let api = "https://danbooru.donmai.us/posts.json?utf8=%E2%9C%93&limit=1&random=true&tags=" + args[0] + '+';
        api += (args[1] == "true" || args[1] == "yes" || args[1] == "nsfw" || args[1] == "hentai") ? "rating:e" : "rating:s";
        let channel = msg.channel;

        channel.startTyping();
        util.getJSON(api, (res) => {
            if (res.length == 0 || res.success == false) {
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "title": "No Image Found."
                });
            } else {
                let post = res[0];
                let img = post.hasOwnProperty("file_url") ? post["file_url"] : post["source"];
                index.print(msg, {
                    "title": post["tag_string_artist"],
                    "url": "https://danbooru.donmai.us/posts/" + post["id"],
                    "color": index.SUCCESS_COLOR,
                    "footer": {
                        "text": (post["rating"] == 's' ? "Safe For Work" : "Not Safe For Work")
                    },
                    "timestamp": post["updated_at"],
                    "author": {
                      "name": "Danbooru",
                      "url": "https://danbooru.donmai.us/"
                    },
                    "image": {
                        "url": img
                    }
                });
            }
            channel.stopTyping();
        });
    },
    syntax: "(tag) (nsfw?)",
    info: "Retrieves an image from Danbooru.",
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
};