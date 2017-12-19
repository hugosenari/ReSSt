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
            this.categories = JSON.parse(localStorage.getItem('feeds') || '[]');
            return load('tree=root')
                .then(body => {
                    const items = body.Items;
                    localStorage.setItem('feeds', JSON.stringify(items));
                    this.categories = items;
                    this.loading = false;
                });
        }
    }
});
