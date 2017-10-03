/*jshint esversion: 6 */

window.ReSSt.settings.service = Promise.resolve({
    data () {
        return {
            api_key: localStorage.getItem('api_key'),
            api_endpoint: localStorage.getItem('api_endpoint'),
            show_readed: localStorage.getItem('show_readed') === 'true'
        };
    },
    watch: {
        api_key: val => localStorage.setItem('api_key', val),
        api_endpoint: val => localStorage.setItem('api_endpoint', val),
        show_readed: val => localStorage.setItem('show_readed', val), 
    },
    methods: {
        onSave(api_endpoint, api_key) {
            localStorage.setItem('api_key', api_key);
            localStorage.setItem('api_endpoint', api_endpoint);
            this.$router.push('feeds');
        }
    }   
});