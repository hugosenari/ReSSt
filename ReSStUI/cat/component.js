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
            const methods = this.$parent.$options.methods;
            const load = methods.fetchData;
            const setList = methods.setList;
            this.$parent.$emit('BackTo', `#/feeds`); 
            load('uid=' + uid).then(body => {
                const self = body.Items[0];
                self.Items = this.self.Items;
                this.self = self;
            });
            return load(`tree=${uid}&unread=1`)
                .then(body => {
                    this.self.Items = [];
                    this.loading = false;                    
                    for (const item of body.Items) {
                        this.self.Items = this.self.Items.concat(item.Items); 
                    }
                    setList(this.self.Items);
                });
        },
    }
});