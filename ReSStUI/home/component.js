/*jshint esversion: 6 */
window.ReSSt.home = window.ReSSt
    .mapState('key', 'endpoint')
    .then(({key, endpoint}) => (
        {
            created () { this.apiFromQuery(); },
            watch: { '$route': 'apiFromQuery' },
            computed: { key, endpoint },
            methods: {
                apiFromQuery () {
                    const query = this.$route.query;
                    if(query.key && query.endpoint) {
                        endpoint.set(query.endpoint);
                        key.set(query.key);
                        this.$router.push('feeds');
                    }
                },
                onSave () { this.$router.push('feeds'); }
            }
        }
    ));
