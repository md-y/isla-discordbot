const util = require("../js/util.js");

module.exports = {
    execute: function(msg, args, index) {
        const api = "https://mangadex.org/";

        const onlyDigits = /^\d+$/;
        const searchId = /<a.*href="\/title\/(\d+)\/.+".*>/mi;

        let channel = msg.channel;

        const unknownManga = function() {
            index.print(msg, {
                "color": index.ERROR_COLOR,
                "title": "Unknown Manga"
            });
            if (channel.typing) channel.stopTyping();
        }

        if (args[0] == undefined) {
            print(msg, {
                "color": index.ERROR_COLOR,
                "title": "Please enter a MangaDex ID or Manga Title"
            });
            return;
        }
        
        const getManga = (mangaId) => {
            util.getJSON(api + "api/manga/" + mangaId, (res)=>{
                if (res.length == 0 || res.status == "Manga ID does not exist.") {
                    unknownManga();
                } else {
                    let manga = res["manga"];
                    let description = util.parseMarkdown(manga["description"]);
                    if (description.length >= 1024) description = description.substring(0, 1024) + "...";

                    let chapters = res["chapter"];
                    let latestChapter = {
                        "title": "There are no chapters in your language.", 
                        "url": api + "manga/" + mangaId, 
                        "timestamp": 0,
                        "volume": "",
                        "chapter": ""
                    };
                    if (chapters != null && chapters != undefined) {
                        for (i of Object.keys(chapters)) {
                            if (chapters[i].lang_code == "gb" && latestChapter.timestamp <= chapters[i].timestamp) {
                                latestChapter = chapters[i];
                                latestChapter.id = i;
                                latestChapter.url = api + "chapter/" + i;
                                if (latestChapter.title == "") latestChapter.title = "Chapter";
                                if (latestChapter.volume != "") latestChapter.volume = "Vol. " + latestChapter.volume;
                                if (latestChapter.chapter != "") latestChapter.chapter = "Ch. " + latestChapter.chapter;
                            }
                        }
                    }

                    index.print(msg, {
                        "title": manga["title"],
                        "url": api + "manga/" + mangaId,
                        "color": index.SUCCESS_COLOR,
                        "description": description,
                        "author": {
                            "name": "MangaDex",
                            "url": api
                        },
                        "footer": {
                            "text": manga["lang_name"],
                            "icon_url": api + "images/flags/" + manga["lang_flag"] + ".png"
                        },
                        "thumbnail": {
                            "url": "https://mangadex.org" + manga["cover_url"].split("?", 1)[0]
                        },
                        "fields": [
                            {
                                "name": "Author",
                                "value": manga["author"],
                                "inline": true
                            },
                            {
                                "name": "Artist",
                                "value": manga["artist"],
                                "inline": true
                            },
                            {
                                "name": "Most Recent Chapter: " + latestChapter.volume + " " + latestChapter.chapter,
                                "value": "[" + (latestChapter.title) +"](" + latestChapter.url + ")"
                            }
                        ]
                    });
                    channel.stopTyping();
                }
            }); 
        }

        channel.startTyping();
        if (onlyDigits.test(args[0]) && args.length == 1) {
            getManga(args[0]);
        } else { //Title Search
            util.getHttp(api + "quick_search/" + encodeURI(args.join(" ")), (res)=>{
                let groups = searchId.exec(res);
                if (groups != undefined && groups != null) getManga(groups[1]);
                else unknownManga();
            });
        }
    },
    syntax: "md [id/title]",
    info: "Retrieves readable manga from MangaDex.",
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"]
};