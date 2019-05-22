const https = require("https");

module.exports.parseMarkdown = function(str) {
    const patterns = [
        // Generic HTML to Markdown
        ["**$1**", /\[b\](.*?)\[\/b\]/gmi], // [b] to **
        ["*$1*", /\[i\](.*?)\[\/i\]/gmi], // [i] to *
        ["__$1__", /\[u\](.*?)\[\/u\]/gmi], // [u] to __
        ["~~$1~~", /\[s\](.*?)\[\/s\]/gmi], // [s] to ~~
        ["||$1||", /\[spoiler\](.*?)\[\/spoiler\]/gmi], // [spoiler] to ||
        ["\"", /&quot;/gmi, /\[quote\]/gmi, /\[\/quote\]/gmi], // &quot; and [quote] to "
        ["```$1```", /\[code\](.*?)\[\/code\]/gmi], // [code] to ```
        ["&", /&amp/gmi], // &amp; to &
        ["<", /&lt;/gmi], // &lt; to <
        [">", /&gt;/gmi], // &gt; to >
        ["'", /&rsquo;/gmi, /(&lsquo;)/gmi], // &rsquo; and &lsquo; to '
        ["[$1 ]($2)", /\[url=(.*?)\](.*?)\[\/url\]/gmi], // Links

        // Remove These Elements
        ["", /\[hr\]/gmi, /\[\/hr\]/gmi, /\[ol\]/gmi, /\[\/ol\]/gmi, /\[left\]/gmi, /\[\/left\]/gmi,
        /\[ul\]/gmi, /\[\/ul\]/gmi, /\[sub\]/gmi, /\[\/sub\]/gmi, /\[sup\]/gmi, /\[\/sup\]/gmi, /\[img\]/gmi,
        /\[\/img\]/gmi, /\[right\]/gmi, /\[\/right\]/gmi, /\[center\]/gmi, /\[\/center\]/gmi] 
    ]

    str = decodeURI(str);
    for (i of patterns) for (r of i.slice(1)) str = str.replace(r, i[0]);
    return str;
}

module.exports.getHttp = function(url, callback) {
    https.get(url, (res) => {
        let str = "";

        res.on("data", (data) => {
            str += data;
        });

        res.on("end", () => {
            callback(str);
        });
    }).on("error", (err) => {
        callback(err);
    });
}

module.exports.getJSON = function(url, callback) {
    module.exports.getHttp(url, (str)=>{
        if (str[0] != '{' && str[0] != '[') {
            callback([]);
            return;
        }
        callback(JSON.parse(str));
    });
}