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
        if ((/^\d+$/).test(args[0])) loadManga(parseInt(args[0]), msg, index);
        else api.Manga.search(args.join(" ")).then((res)=>{
            loadManga(res[0], msg, index);
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
                    "value": manga.authors.join(", "),
                    "inline": true
                },
                {
                    "name": "Artist(s)",
                    "value": manga.artists.join(", "),
                    "inline": true
                },
                {
                    "name": "Genres",
                    "value": manga.genreNames.length > 0 ? manga.genreNames.join(", ") : "No Defined Genres."
                },
                {
                    "name": "Links",
                    "value": links
                },
                {
                    "name": "Most Recent Chapter " + (manga.chapters[0].chapter ? '('+ manga.chapters[0].chapter + ')' : ""),
                    "value": "[" + manga.chapters[0].title +"](" + manga.chapters[0].getFullURL("id") + ")"
                }
            ]
        });
    }).catch((err)=>{
        index.print(msg, {
            "color": index.ERROR_COLOR,
            "title": "Could not load manga."
        });
    });
}