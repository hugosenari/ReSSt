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
        this.updatePluginList();
    },
    watch: {},
    methods: {
        loadPlugin(plugin_name, plugin_address) {
            const app = window.ReSSt.App;
            app.$emit('LoadPlugin', plugin_name, plugin_address);
            app.$on('LoadPlugin', this.updatePluginList);
            app.$on('RemovePlugin', this.updatePluginList);
            app.$on('PluginReady', this.updatePluginList);
            app.$on('PluginEnabled', this.updatePluginList);
            app.$on('PluginDisabled', this.updatePluginList);
            this.updatePluginList();
        },
        unloadPlugin(name) {
            const app = window.ReSSt.App;
            app.$emit('RemovePlugin', name);
            this.updatePluginList();
        },
        changePluginState(name, state) {
            const app = window.ReSSt.App;
            if (state) {
                app.$emit('PluginEnabled', name);
            } else {
                app.$emit('PluginDisabled', name);
            }
            this.updatePluginList();
        },
        updatePluginList() {
            const app = window.ReSSt.App;
            const methods = app.$options.methods;
            this.plugins = methods.getPlugins();
        }
    }   
});