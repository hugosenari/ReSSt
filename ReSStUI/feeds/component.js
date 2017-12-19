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
            this.categories = localStorage.getItem('categories') || [];
            return load('tree=root')
                .then(body => {
                    const items = body.Items;
                    this.categories = items;
                    localStorage.setItem('categories', items);
                    this.loading = false;
                });
        }
    }
});
