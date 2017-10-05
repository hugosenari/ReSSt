/*jshint esversion: 6 */

(() => {
    const name = 'imgurian'
    const template = `<div><md-content v-for="url in urls"><plugin-${name}-embed :uri="url"></plugin-${name}-embed></md-content></div>`;
    const buttonTemplate = `<div>
    <md-button class="md-icon-button md-raised" title="show this" @click="show = true" v-if="!show">
        <md-icon>play_arrow</md-icon>
    </md-button>
    <div v-if="show">
        <iframe frameBorder="0" allowFullScreen
        :src="'https://imgur.com/'+ imageId + '/embed'"></iframe>
    </div>
</div>`;
    const getUrlId = path => path && path.replace(/.+imgur\.com\/([^.#?]+)\.*.*/, '$1').replace(/gallery\//, '');
    const getUrls = content => {
        const urls = [];
        if (content) {
            const matches = content.match(/href=["'][^'"]+/g);
            if (matches) {
                for (const match of matches){
                    const url = match.replace(/href=["']/, '');
                    if (url.match(/.+imgur\.com\//)){
                        urls.push(url);
                    }
                }
            }
        }
        return urls;
    };
    window.ReSSt.plugin.embedComponent({
        name,
        component: {
            name: `plugin-${name}`,
            template,
            props: ['text'],
            created () {
                this.urls = getUrls(this.text);
            },
            data () { return { urls: [] } },
            watch: { text (val) { this.urls = getUrls(val);} },
            components: {
                [`plugin-${name}-embed`]: function() {
                    return Promise.resolve({
                        template: buttonTemplate,
                        props: ['uri'],
                        data () { return {imageId: null, show: localStorage.getItem('plugins_auto_play') === 'true' } },
                        created () { this.imageId = getUrlId(this.uri); },
                        watch: { uri (val) { this.imageId = getUrlId(val); this.show = localStorage.getItem('plugins_auto_play') === 'true'; } }
                    });
                }
            }
        }
    });
})();
