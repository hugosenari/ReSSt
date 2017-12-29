/*jshint esversion: 6 */

window.ReSSt.plugin = window.ReSSt
.mapState('pluginsAutoPlay', 'plugins')
.then(({ pluginsAutoPlay, plugins, set, get }) => {
    return {
        created () {
            this.loadPlugins();
        },
        methods: {
            getPlugins() { return get(this, 'plugins'); },
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
                set(this, 'plugins', plugins)
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
                this.$root.$emit('PluginDisabled', name);
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
                if (this._plugins.includes(name)) {
                    this.$root.$emit('PluginEnabled', name);
                }
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
                this.$root.$on('LoadPlugin', this.loadPlugin);
                this.$root.$on('RemovePlugin', this.removePlugin);
                this.$root.$on('PluginReady', this.pluginReady);
                this.$root.$on('PluginEnabled', this.pluginEnabled);
                this.$root.$on('PluginDisabled', this.pluginDisabled);
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
    }

});

window.ReSSt.plugin.embedComponent = opts => {
    window.ReSSt.lib().then(({Vue, app}) => {
        let enabled = false;
        let itemVue = null;
        const name = opts.name;
        const component = opts.component;
        Vue.component(`plugin-${name}`, component);
        app().$on('PluginEnabled', n => {
            if (n === name) {
                enabled = true;
                itemVue && itemVue.$emit('RegisterEmbeder', component);
            }
        });
        app().$on('PluginDisabled', n => {
            if (n === name) {
                enabled = false;
                itemVue && itemVue.$emit('UnregisterEmbeder', component);
            }
        });
        app().$on('ItemView', vue => {
            itemVue = vue;
            enabled && itemVue.$emit('RegisterEmbeder', component);
        });
        app().$emit('PluginReady', name);
    });
};