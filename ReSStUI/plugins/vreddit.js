/*jshint esversion: 6 */

(() => {
    const name = 'vreddit';
    const urlMatch = /.+v\.redd\.it\//;
    const getUrlId = path => path && path.replace(/.+v\.redd\.it\/([^#?]+)/, '$1');
    const iframeUrl = `'https://v.redd.it/'+ imageId + '/DASH_600_K'`;
    const template = `<div class="embed-plugin embed-plugin-${name}"><md-content v-for="url in urls"><plugin-${name}-embed :uri="url"></plugin-${name}-embed></md-content></div>`;
    const buttonTemplate = `<div class="embed-plugin-item">
    <md-button class="md-icon-button md-raised" title="show this" @click="show = true" v-if="!show">
        <md-icon>play_arrow</md-icon>
    </md-button>
    <div v-if="show" class="embed-plugin-frame" style="padding-top:0">
        <video autoplay loop controls :src="${iframeUrl}"/>
    </div>
</div>`;
    const getUrls = content => {
        const matches = content && content.match(/href=["'][^'"]+/g) || [];
        return matches.filter(match => match.match(urlMatch))
            .map(match => match.replace(/href=["']/, ''));
    };
    const setHeight = (a, o) => a.data && a.data.match(/resize_imgur/) && Object.assign(o, { height: JSON.parse(a.data).height + 40});
    const listen = o => window.addEventListener('message', a => setHeight(a, o), false); 
    window.ReSSt.plugin.embedComponent({
        name,
        component: {
            name: `plugin-${name}`,
            template,
            props: ['text'],
            created () {this.urls = this.text ? getUrls(this.text) : [];},
            data () { return { urls: [] }; },
            watch: { text (val) { this.urls = getUrls(val);} },
            components: {
                [`plugin-${name}-embed`]: function() {
                    return Promise.resolve({
                        template: buttonTemplate,
                        props: ['uri'],
                        data () { return {imageId: null, show: localStorage.getItem('plugins_auto_play') === 'true', height: 0 }; },
                        created () { this.imageId = getUrlId(this.uri); listen(this);},
                        watch: { uri (val) { this.imageId = getUrlId(val); this.show = localStorage.getItem('plugins_auto_play') === 'true'; } }
                    });
                }
            }
        }
    });
})();
