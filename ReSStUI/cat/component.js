/*jshint esversion: 6 */

window.ReSSt.cat = Promise.resolve({
    data () {
        return {
            loading: true,
            self: {}
        };
    },
    created () { this.loadFeeds(); },
    watch: { '$route': 'loadFeeds' },
    methods: {
        loadFeeds () {
            const uid = this.$route.params.category;
            const load = this.$parent.$options.methods.fetchData;
            load('uid=' + uid).then(body => {
                const self = body.Items[0];
                self.Items = this.self.Items;
                this.self = self;
            });
            return load('tree=' + uid)
                .then(body => {
                    this.self.Items = [];
                    
                    for (const item of body.Items) {
                        this.self.Items = this.self.Items.concat(item.Items); 
                    }
                    this.loading = false;
                });
        },
    }
});