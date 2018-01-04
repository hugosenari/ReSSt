/*jshint esversion: 6 */
window.ReSSt.settings.service = window.ReSSt
    .mapState('key', 'endpoint', 'showReaded')
    .then(computed => ({
        computed: Object.assign(
            {
                sharelogin: function () {
                    const index = `${window.location.origin}${window.location.pathname}`;
                    return `${index}#?key=${this.key}&endpoint=${this.endpoint}`;
                }
            },
            computed
        )
    }));
