const api = require("mangadex-full-api");
const util = require("../js/util.js");

module.exports = {
    execute: function(msg, args, index) {
        if (args.length < 1) {
            index.print(msg, {
                "color": index.ERROR_COLOR,
                "title": "Please enter a MangaDex ID or Manga Title"
            });
            return;
        }

        msg.channel.startTyping();
        if ((/^\d+$/).test(args.join(""))) loadManga(parseInt(args[0]), msg, index);
        else api.Manga.search(args.join(" ")).then((res)=>{
            if (res.length == 0) {
                msg.channel.stopTyping();
                index.print(msg, {
                    "color": index.ERROR_COLOR,
                    "title": "No Manga Found."
                });
            } else loadManga(res[0], msg, index);
        });
    },
    syntax: "md [id/title]",
    info: "Retrieves readable manga from MangaDex.",
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
};

function loadManga(id, msg, index) {
    let manga = new api.Manga();
    manga.fill(id).then(()=>{
        // Prepare Info
        let links = ""
        for (let i in manga.links) links += '[' + api.link[i].name + '](' + manga.links[i] + ')\n'; 
        if (links.length == 0) links = "No Additional Links"

        // Print info
        msg.channel.stopTyping();
        index.print(msg, {
            "title": manga.title,
            "url": manga.getFullURL("id"),
            "color": index.SUCCESS_COLOR,
            "description": util.parseMarkdown(manga.description.slice(0, 1000)),
            "author": {
                "name": "MangaDex",
                "url": "https://www.mangadex.org/"
            },
            "footer": {
                "text": api.language[manga.language],
                "icon_url": manga.getFullURL("flag")
            },
            "thumbnail": {
                "url": manga.getFullURL("cover")
            },
            "fields": [
                {
                    "name": "Author(s)",
                    "value": manga.authors.length > 0 ? manga.authors.join(", ") : "No Authors",
                    "inline": true
                },
                {
                    "name": "Artist(s)",
                    "value": manga.artists.length > 0 ? manga.artists.join(", ") : "No Artists",
                    "inline": true
                },
                {
                    "name": "Genres",
                    "value": manga.genreNames.length > 0 ? manga.genreNames.join("\n") : "No Defined Genres.",
                    "inline": true
                },
                {
                    "name": "Links",
                    "value": links,
                    "inline": true
                },
                {
                    "name": "Most Recent Chapter " + (manga.chapters[0].chapter ? '('+ manga.chapters[0].chapter + ')' : ""),
                    "value": "[" + (manga.chapters[0].title ? manga.chapters[0].title : "Chapter") +"](" + manga.chapters[0].getFullURL("id") + ")",
                    "inline": true
                },
                {
                    "name": "Hentai?",
                    "value": manga.hentai ? "Yes": "No",
                    "inline": true
                },
            ]
        });
    }).catch((err)=>{
        msg.channel.stopTyping();
        index.print(msg, {
            "color": index.ERROR_COLOR,
            "title": "Could not load manga."
        });
    });
}