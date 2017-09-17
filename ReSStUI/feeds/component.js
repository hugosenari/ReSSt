/*jshint esversion: 6 */

window.ReSSt.feeds = Promise.resolve({
    data () {
        return {
            loading: true,
            categories: []
        };
    },
    created () { this.loadCategories(); },
    watch: { '$route': 'loadCategories' },
    methods: {
        loadCategories () {
            const load = this.$parent.$options.methods.fetchData;
            return load('tree=root')
                .then(body => {
                    this.categories = body.Items;
                    this.loading = false;
                });
        }
    }
});
