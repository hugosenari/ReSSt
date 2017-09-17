/*jshint esversion: 6 */

window.ReSSt.feed = Promise.resolve({
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
            const uid = this.$route.params.feed;
            const load = this.$parent.$options.methods.fetchData;
            load('uid=' + uid).then(body => {
                const self = body.Items[0];
                self.Items = this.self.Items;
                this.self = self;
            });
            return load('tree=' + uid)
                .then(body => {
                    this.self.Items = body.Items;
                    this.loading = false;
                });
        },
    }
});