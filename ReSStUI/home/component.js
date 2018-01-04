/*jshint esversion: 6 */
window.ReSSt.home = window.ReSSt
    .mapState('key', 'endpoint')
    .then(computed => (
        {
            created () { this.apiFromQuery(); },
            watch: { '$route': 'apiFromQuery' },
            computed,
            methods: {
                apiFromQuery () {
                    const query = this.$route.query;
                    if(query.key && query.endpoint) {
                        computed.endpoint.set(query.endpoint);
                        computed.key.set(query.key);
                        this.$router.push('feeds');
                    }
                },
                onSave () { this.$router.push('feeds'); }
            }
        }
    ));
