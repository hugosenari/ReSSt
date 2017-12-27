/*jshint esversion: 6 */

window.ReSSt.feeds = window.ReSSt
    .mapState('categories', 'backto')
    .then(({ categories, backto, set, fetchData })  => {
        return {
            computed: { categories, backto },
            data () { return { loading: true }; },
            created () { this.loadCategories(); },
            watch: { '$route': 'loadCategories' },
            methods: {
                loadCategories () {
                    const { state } = this.$store;
                    fetchData({ state }, 'tree=root')
                        .then(body => set(this, 'categories', body.Items))
                        .then(() => this.loading = false);
                    set(this, 'backto');
                }
            }
        };
    });
