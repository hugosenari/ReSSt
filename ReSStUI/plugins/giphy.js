/*jshint esversion: 6 */

(() => {
    const name = 'giphy';
    const urlMatch = /.+giphy\.com\//;
    const getUrlId = path => path && path
        .replace(/.+giphy\.com\/(media|gifs)\/([^.#?\/]+)\.*.*/, '$2')
        .replace(/.+giphy\.com\/([^.#?\/]+)\.*.*/, '$1')
        .split('-')
        .pop();
    const iframeUrl = `'https://${name}.com/embed/' + imageId`; 
    const template = `<div class="embed-plugin embed-plugin-${name}"><md-content v-for="url in urls"><plugin-${name}-embed :uri="url"></plugin-${name}-embed></md-content></div>`;
    const buttonTemplate = `<div class="embed-plugin-item">
    <md-button class="md-icon-button md-raised" title="show this" @click="show = true" v-if="!show">
        <md-icon>play_arrow</md-icon>
    </md-button>
    <div v-if="show" class="embed-plugin-frame">
        <iframe frameBorder="0" allowFullScreen
            :src="${iframeUrl}"></iframe>
    </div>
</div>`;
    const getUrls = content => {
        const matches = content && content.match(/href=["'][^'"]+/g) || [];
        return matches.filter(match => match.match(urlMatch))
            .map(match => match.replace(/href=["']/, ''));
    };
    window.ReSSt.plugin.embedComponent({
        name,
        component: {
            name: `plugin-${name}`,
            template,
            props: ['text'],
            created () { this.urls = this.text ? getUrls(this.text) : []; },
            data () { return { urls: [] }; },
            watch: { text (val) { this.urls = getUrls(val); } },
            components: {
                [`plugin-${name}-embed`]: function() {
                    return Promise.resolve({
                        template: buttonTemplate,
                        props: ['uri'],
                        data () { return {imageId: null, show: this.$store.state.pluginsAutoPlay }; },
                        created () { this.imageId = getUrlId(this.uri); },
                        watch: { uri (val) { this.imageId = getUrlId(val); this.show = this.$store.state.pluginsAutoPlay; } },
                    });
                }
            }
        }
    });
})();
