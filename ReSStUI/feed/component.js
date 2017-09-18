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
            const methods = this.$parent.$options.methods;
            const load = methods.fetchData;
            const setList = methods.setList;
            this.$parent.$emit('BackTo', '#/feeds');
            load('uid=' + uid).then(body => {
                const self = body.Items[0];
                self.Items = this.self.Items;
                this.self = self;
            });
            return load(`parent=${uid}&unread=1`)
                .then(body => {
                    this.self.Items = body.Items;
                    setList(this.self.Items);
                    this.loading = false;
                });
        },
    }
});