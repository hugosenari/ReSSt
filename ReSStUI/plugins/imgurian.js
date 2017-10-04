/*jshint esversion: 6 */

(() => {
    let enabled = false;
    const app = window.ReSSt.App;
    const name = 'imgurian';
    const getImagurBtn = path => {
        var id = path.replace(/.+imgur\.com\/([^.#?]+)\.*.*/, '$1');
        id = id.replace(/gallery\//, '');
        return !id ? '':`<blockquote class="imgur-embed-pub" lang="en" data-id="${id}" data-context="false">
    <md-button 
        class="md-fab md-mini md-raised"
        title="show this"
        onclick="(() => {const script = document.createElement('script'); script.src = '//s.imgur.com/min/embed.js'; body.appendChild(script);})();">
        <i class="material-icons" style="font-size:44px;">play_circle_outline</i>
    </md-button>
</blockquote>`;
    };
    const getUrls = content => {
        const urls = [];
        if (content) {
            for (const match of content.match(/href=["'][^'"]+/g)){
                const url = match.replace(/href=["']/, '');
                if (url.match(/.+imgur\.com\//)){
                    urls.push(url);
                }
            }
        }
        return urls;
    };
    app.$on('PluginEnabled', n => n === name && (enabled = true));
    app.$on('PluginDisabled', n => n === name && (enabled = false));
    app.$on('BeforeShowItem', item => {
        if (enabled) {
            let urls = [];
            if (item) {
               urls = urls.concat(getUrls(item.summary)); 
            }
            for (const i of item.content.keys()) {
                urls = urls.concat(getUrls(item.content[i]));
            }
            for (const url of urls) {
                item.content.push(getImagurBtn(url));
            }
        }
        return item;
    });
    app.$emit('PluginReady', name);
})();