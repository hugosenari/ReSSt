/*jshint esversion: 6 */

window.ReSSt.settings = Promise.resolve({
    components: {
        'settings-service' : () => window.ReSSt.loadComponent('service', 'settings/', window.ReSSt.settings)(),
        'settings-plugins' : () => window.ReSSt.loadComponent('plugins', 'settings/', window.ReSSt.settings)()
    },
    created () {
        this.$parent.$emit('BackTo', '#/feeds');
    }
});