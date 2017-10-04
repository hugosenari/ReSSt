/*jshint esversion: 6 */

(() => {
    let enabled = false;
    const app = window.ReSSt.App;
    const name = 'gfycat';
    const getBtn = path => {
        var id = path.replace(/.+gfycat\.com\/([^.#?]+)\.*.*/, '$1');
        return !id ? '':`<div class="gfyitem" data-title=true data-autoplay=true
    data-controls=true data-id="${id}" data-responsive=true data-hd=false>
    <md-button class="md-fab md-mini md-raised" title="show this"
        onclick="(() => {window.gfyCollection.init();})();">
        <i class="material-icons" style="font-size:44px;">play_circle_outline</i>
    </md-button>
</div>`;
    };
    const getUrls = content => {
        const urls = [];
        if (content) {
            const matches = content.match(/href=["'][^'"]+/g);
            if (matches) {
                for (const match of matches){
                    const url = match.replace(/href=["']/, '');
                    if (url.match(/.+gfycat\.com\//)){
                        urls.push(url);
                    }
                }
            }
        }
        return urls;
    };
    app.$on('PluginEnabled', n => {
        if (n === name) {
            enabled = true;
            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "https://assets.gfycat.com/gfycat.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'gfycat-js'));
        }
    });
    app.$on('PluginDisabled', n => n === name && (enabled = false));
    app.$on('BeforeShowItem', item => {
        if (enabled) {
            let urls = [];
            if (item) {
                urls = urls.concat(getUrls(item.summary));
                for (const i of item.content.keys()) {
                    urls = urls.concat(getUrls(item.content[i]));
                }
                for (const url of urls) {
                    item.content.push(getBtn(url));
                }
            }
        }
        return item;
    });
    app.$emit('PluginReady', name);
})();