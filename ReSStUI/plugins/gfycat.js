/*jshint esversion: 6 */

(() => {
    const name = 'gfycat'
    const template = `<div class="embed-plugin"><md-content v-for="url in urls"><plugin-${name}-embed :uri="url"></plugin-${name}-embed></md-content></div>`;
    const buttonTemplate = `<div class="embed-plugin-item">
    <md-button class="md-icon-button md-raised" title="show this" @click="show = true" v-if="!show">
        <md-icon>play_arrow</md-icon>
    </md-button>
    <div v-if="show" class="embed-plugin-frame">
        <iframe frameBorder="0" allowFullScreen
        :src="'https://gfycat.com/ifr/' + imageId"></iframe>
    </div>
</div>`;
    const getUrlId = path => path && path.replace(/.+gfycat\.com\/([^.#?-]+)\.*.*/, '$1');
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
            watch: { text (val) { this.urls = getUrls(val); } },
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
