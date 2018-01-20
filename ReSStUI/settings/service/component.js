/*jshint esversion: 6 */
window.ReSSt.settings.service = window.ReSSt
.mapState('key', 'endpoint', 'showReaded')
.then(({ key, endpoint, showReaded }) => ({
    computed: {
        key, endpoint, showReaded,
        sharelogin: function () {
            const index = `${window.location.origin}${window.location.pathname}`;
            return `${index}#?key=${this.key}&endpoint=${this.endpoint}`;
        }
    }
}));
