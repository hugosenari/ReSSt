/*jshint esversion: 6 */

const Vue = window.Vue;
window.ReSSt.home = Promise.resolve({
    data () {
        return {
            api_key: localStorage.getItem('api_key'),
            api_endpoint: localStorage.getItem('api_endpoint') 
        };
    },
    methods: {
        onSave (api_endpoint, api_key) {
            localStorage.setItem('api_key', api_key);
            localStorage.setItem('api_endpoint', api_endpoint);
            this.$router.push('feeds');
        }
    }
});