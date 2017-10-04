/*jshint esversion: 6 */

window.ReSSt.plugin = Promise.resolve({
    created () {
        new Promise(resolve => resolve(this.loadPlugins()));
    },
    methods: {
        getPlugins() {
            return JSON.parse(localStorage.getItem('plugins') || '{}');
        },
        addScript(name, src) {
            const body = document.getElementsByTagName('body')[0];
            let script = document.getElementById('plugins_' + name);
            if (!script) {
                script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = src;
                script.id = 'plugins_' + name;
                body.appendChild(script);
            }
        },
        setPlugins(plugins) {
            localStorage.setItem('plugins', JSON.stringify(plugins));
            for (const name of Object.keys(plugins)) {
                this.addScript(name, plugins[name].address);
            }
            return plugins;
        },
        setPlugin(name, plugin) {
            const plugins = this.getPlugins();
            plugins[name] = plugin;
            return this.setPlugins(plugins);
        },
        removePlugin(name) {
            const app = window.ReSSt.App;
            app.$emit('PluginDisabled', name);
            const plugins = this.getPlugins();
            delete plugins[name];
            return this.setPlugins(plugins);
        },
        getPlugin(name) {
            return this.getPlugins()[name];
        },
        setPluginState(name, state) {
            const plugin = this.getPlugin(name);
            plugin.state = state;
            return this.setPlugin(name, plugin);
        },
        loadPlugin(name, address) {
            const state = false;
            const newPlugin = { address,  state, name };
            const plugin = this.getPlugin(name) || newPlugin;
            return this.setPlugin(name, plugin);
        },
        unloadPlugin(name) {
            return this.removePlugin(name);
        },
        pluginReady(name) {
            const app = window.ReSSt.App;
            if (this._plugins.includes(name)) {
                app.$emit('PluginEnabled', name);
            }
            return this.setPluginState(name, true);
        },
        pluginEnabled(name) {
            if (!this._plugins.includes(name)) {
                this._plugins = [name].concat(this._plugins);
            }
            return this.setPluginState(name, true);
        },
        pluginDisabled(name) {
            this._plugins = this._plugins.filter(i => i !== name);
            return this.setPluginState(name, false);
        },
        loadPlugins() {
            const app = window.ReSSt.App;
            app.$on('LoadPlugin', this.loadPlugin);
            app.$on('RemovePlugin', this.removePlugin);
            app.$on('PluginReady', this.pluginReady);
            app.$on('PluginEnabled', this.pluginEnabled);
            app.$on('PluginDisabled', this.pluginDisabled);
            this._plugins = [];
            const plugins = this.getPlugins();
            for (const name of Object.keys(plugins)) {
                if (plugins[name].state) {
                    this._plugins = [name].concat(this._plugins);
                }
            }
            return this.setPlugins(plugins);
        }
    }
});
