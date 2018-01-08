/*jshint esversion: 6 */

window.ReSSt.feeds = window.ReSSt
    .mapState('categories', 'backto')
    .then(({ categories, backto, set, patchAs })  => {
        return {
            computed: { categories, backto },
            data () { return { loading: true }; },
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
