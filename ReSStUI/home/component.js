/*jshint esversion: 6 */

const Vue = window.Vue;
window.ReSSt.home = Promise.resolve({
    data () {
        return {
            api_key: localStorage.getItem('api_key')
        };
    },
    methods: {
        onSave (api_key) {
            localStorage.setItem('api_key', api_key);
            this.$router.push('feeds');
        }
    }
});