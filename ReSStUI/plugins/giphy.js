/*jshint esversion: 6 */

(() => {
    const name = 'giphy'
    const template = `<div><md-content v-for="url in urls"><plugin-${name}-embed :uri="url"></plugin-${name}-embed></md-content></div>`;
    const buttonTemplate = `<div><md-button class="md-icon-button md-raised" title="show this" @click="show = true" v-if="!show">
        <md-icon>play_arrow</md-icon>
    </md-button>
    <md-layout md-flex="true" v-if="show">
        <p><a :href="'https://${name}.com/gifs/' + imageId" target="_blank" style="display: block; position: absolute">via GIPHY</a></p>
        <div><iframe :src="'https://${name}.com/embed/' + imageId" frameBorder="0" allowFullScreen style="position:absolute;top:0;left:0;height:20%;"></iframe></div>
    </md-layout>
</div>`;
    const getUrlId = path => path && path.replace(/.+giphy\.com\/(media|gifs)\/([^.#?\/]+)\.*.*/, '$2');
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
    window.ReSSt.plugin.embedComponent({
        name: name,
        component: {
            name: `plugin-${name}`,
            template,
            props: ['text'],
            created () { this.urls = getUrls(this.text); },
            data () { return { urls: [] } },
            watch: { text (val) { this.urls = getUrls(val); } },
            components: {
                [`plugin-${name}-embed`]: function() {
                    return Promise.resolve({
                        template: buttonTemplate,
                        props: ['uri'],
                        data () { return {imageId: null, show: false } },
                        created () { this.imageId = getUrlId(this.uri); },
                        watch: { uri (val) { this.imageId = getUrlId(val); } },
                    });
                }
            }
        }
    });
})();
