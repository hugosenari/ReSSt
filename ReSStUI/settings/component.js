/*jshint esversion: 6 */

window.ReSSt.settings = window.ReSSt
.mapState('backto')
.then(({ set, get, loadComponent }) => ({
    components: {
        'settings-service' : () => loadComponent('service', 'settings/', window.ReSSt.settings)(),
        'settings-plugins' : () => loadComponent('plugins', 'settings/', window.ReSSt.settings)(),
        'settings-info' : () => loadComponent('info', 'settings/', window.ReSSt.settings)()
    },
    created () {
        if (!get('backto')) { set('backto', '#/feeds'); }
    }
}));