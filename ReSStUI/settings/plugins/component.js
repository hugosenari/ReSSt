/*jshint esversion: 6 */

window.ReSSt.settings.plugins = Promise.resolve({
    data () {
        return {
            plugin_name: '',
            plugin_address: '',
            plugins: {}
        };
    },
    created () {
        const app = window.ReSSt.App;
        app.$on('LoadPlugin', this.updatePluginList);
        app.$on('RemovePlugin', this.updatePluginList);
        app.$on('PluginReady', this.updatePluginList);
        app.$on('PluginEnabled', this.updatePluginList);
        app.$on('PluginDisabled', this.updatePluginList);
        this.updatePluginList();
    },
    watch: {},
    methods: {
        updatePluginList() {
            const app = window.ReSSt.App;
            const methods = app.$options.methods;
            this.plugins = methods.getPlugins();
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