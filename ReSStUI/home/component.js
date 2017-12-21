/*jshint esversion: 6 */
window.ReSSt.home = window.ReSSt
    .mapState('key', 'endpoint')
    .then(computed => (
        {
            computed,
            methods: {
                onSave () { this.$router.push('feeds'); }
            }
        }
    ));
