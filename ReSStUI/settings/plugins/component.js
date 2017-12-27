/*jshint esversion: 6 */

window.ReSSt.settings.plugins = window.ReSSt
    .mapState('pluginsAutoPlay', 'plugins')
    .then(({ pluginsAutoPlay, plugins, set, get }) => {
        return {
            computed: { plugins, pluginsAutoPlay },
            data () {
                return {
                    plugin_name: '',
                    plugin_address: '',
                    know_plugns: [
                        { name: 'blank', address: './plugins/blank.js'},
                        { name: 'chicken', address: './plugins/chicken.js'},
                        { name: 'gfycat', address: './plugins/gfycat.js'},
                        { name: 'giphy', address: './plugins/giphy.js'},
                        { name: 'imgurian', address: './plugins/imgurian.js'},
                        { name: 'vreddit', address: './plugins/vreddit.js'},
                        { name: 'ireddit', address: './plugins/ireddit.js'}
                    ],
                };
            },
            methods: {
                loadPlugin(plugin_name, plugin_address) {
                    this.$root.$emit('LoadPlugin', plugin_name, plugin_address);
                    this.$forceUpdate();
                },
                unloadPlugin(name) {
                    this.$root.$emit('RemovePlugin', name);
                    this.$forceUpdate();
                },
                changePluginState(name, state) {
                    const eventName =  state ? 'PluginEnabled' : 'PluginDisabled';
                    this.$root.$emit(eventName, name);
                    this.$forceUpdate();
                }
            }
        }
    });
