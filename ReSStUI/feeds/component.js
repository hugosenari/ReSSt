/*jshint esversion: 6 */

window.ReSSt.feeds = window.ReSSt
    .mapState('categories', 'backto')
    .then(({ categories, backto, set, patchAs, DEBUG })  => {
        return {
            computed: { categories, backto },
            data () { return { loading: !DEBUG }; },
            created () { this.loadCategories(); },
            watch: { '$route': 'loadCategories' },
            methods: {
                loadCategories () {
                    patchAs('tree=root')
                        .then(body => set('categories', body.Items))
                        .then(() => this.loading = false);
                    set('backto');
                }
            }
        };
    });
