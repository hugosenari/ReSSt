/*jshint esversion: 6 */

window.ReSSt.settings = Promise.resolve({
    components: {
        'settings-service' : () => window.ReSSt.loadComponent('service', 'settings/', window.ReSSt.settings)()
    }   
});