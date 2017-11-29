/*jshint esversion: 6 */

window.ReSSt.settings.plugins = Promise.resolve({
    data () {
        return {
            plugin_name: '',
            plugin_address: '',
            plugins: {},
            know_plugns: [
                { name: 'blank', address: './plugins/blank.js'},
                { name: 'chicken', address: './plugins/chicken.js'},
                { name: 'gfycat', address: './plugins/gfycat.js'},
                { name: 'giphy', address: './plugins/giphy.js'},
                { name: 'imgurian', address: './plugins/imgurian.js'},
                { name: 'vreddit', address: './plugins/vreddit.js'}
            ],
            auto_play: localStorage.getItem('plugins_auto_play') === 'true'
        };
    },
    created () {
        const app = window.ReSSt.App;
        app.$on('LoadPlugin', this.updatePluginList);
        app.$on('RemovePlugin', this.updatePluginList);
        app.$on('PluginEnabled', this.updatePluginList);
        app.$on('PluginDisabled', this.updatePluginList);
        this.updatePluginList();
    },
    watch: {
        auto_play: val => localStorage.setItem('plugins_auto_play', val), 
    },
    methods: {
        updatePluginList() {
            this.plugins = JSON.parse(localStorage.getItem('plugins') || '{}');
        },
        loadPlugin(plugin_name, plugin_address) {
            const app = window.ReSSt.App;
            app.$emit('LoadPlugin', plugin_name, plugin_address);
        },
        unloadPlugin(name) {
            const app = window.ReSSt.App;
            app.$emit('RemovePlugin', name);
        },
        changePluginState(name, state) {
            const app = window.ReSSt.App;
            const eventName =  state ? 'PluginEnabled' : 'PluginDisabled';
            app.$emit(eventName, name);
        }
    }   
});