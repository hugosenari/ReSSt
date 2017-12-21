/*jshint esversion: 6 */

window.ReSSt.settings = window.ReSSt
.mapState('backto')
.then(({ set, get, loadComponent }) => ({
    components: {
        'settings-service' : () => loadComponent('service', 'settings/', window.ReSSt.settings)(),
        'settings-plugins' : () => loadComponent('plugins', 'settings/', window.ReSSt.settings)()
    },
    created () {
        console.log(get(this, 'backto'));
        if (!get(this, 'backto')) {
            set(this, 'backto', '#/feeds');
        }
    }
}));