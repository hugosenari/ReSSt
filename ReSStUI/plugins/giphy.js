/*jshint esversion: 6 */

(() => {
    let enabled = false;
    const app = window.ReSSt.App;
    const name = 'giphy';
    const getBtn = path => {
        var id = path.replace(/.+giphy\.com\/(media|gifs)\/([^.#?\/]+)\.*.*/, '$2');
        return !id ? '':`<div><iframe src="https://giphy.com/embed/${id}" style="position:absolute" 
        frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div>
        <p><a href="https://giphy.com/gifs/${id}">via GIPHY</a></p>`;
    };
    const getUrls = content => {
        const urls = [];
        if (content) {
            const matches = content.match(/href=["'][^'"]+/g);
            if (matches) {
                for (const match of matches){
                    const url = match.replace(/href=["']/, '');
                    if (url.match(/.+giphy\.com\//)){
                        urls.push(url);
                    }
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