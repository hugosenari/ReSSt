/*jshint esversion: 6 */

window.ReSSt.feeds = window.ReSSt
    .mapState('categories', 'backto')
    .then(({ categories, backto, set, fetch })  => {
        return {
            computed: { categories, backto },
            data () { return { loading: true }; },
            created () { this.loadCategories(); },
            watch: { '$route': 'loadCategories' },
            methods: {
                loadCategories () {
                    fetch('tree=root')
                        .then(body => set('categories', body.Items))
                        .then(() => this.loading = false);
                    set('backto');
                }
            }
        };
    });
