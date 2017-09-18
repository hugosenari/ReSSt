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
            const methods = this.$parent.$options.methods;
            const load = methods.fetchData;
            this.$parent.$emit('BackTo', null);
            return load('tree=root')
                .then(body => {
                    this.categories = body.Items;
                    this.loading = false;
                });
        }
    }
});
