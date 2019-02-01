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

        if ((/^\d+$/).test(args[0])) loadManga(parseInt(args[0]), msg, index);
        else api.Manga.search(args[0]).then((res)=>{
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
        index.print(msg, {
            "title": manga.title,
            "url": manga.getFullURL("cover"),
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
                    "name": "Latest Chapter",
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