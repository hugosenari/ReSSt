/*jshint esversion: 6 */

window.ReSSt.feed = Promise.resolve({
    data () {
        return {
            loading: true,
            self: {},
            current: null,
            Items: {}
        };
    },
    created () {
        this.loadFeeds();
        this.$parent.$on('WindowKeyUp', code => this.onNav(code));
    },
    watch: { '$route': 'loadFeeds' },
    methods: {
        loadFeeds () {
            const uid = this.$route.params.feed;
            const methods = this.$parent.$options.methods;
            const load = methods.fetchData;
            const setList = methods.setList;
            this.$parent.$emit('BackTo', '#/feeds');
            load('uid=' + uid).then(body => {
                this.self = body.Items[0]; 
            });
            return load(`parent=${uid}&unread=1`)
                .then(body => {
                    this.Items = setList(body.Items) || {};
                    this.current = body.Items[0];
                    if (this.current) this.current.active = true;
                    this.loading = false;
                });
        },
        onNav(code) {
            if (this.$route.name === 'ReSSt.feed'){
                const LEFT = 37;
                const RIGHT = 39;
                const O = 79;
                const R = 82;
                const keys = Object.keys(this.Items);
                const uidIndex = this.current && keys.indexOf(this.current.uid) || 0;
                const prev = keys[uidIndex - 1];
                const next = keys[uidIndex + 1];
                if(code === LEFT && prev) {
                    this.moveTo(prev);
                } else if (code === RIGHT && next) {
                    this.moveTo(next);
                } else if (code === O && this.current) {
                    window.open(this.current.link, this.current.uid);
                } else if (code === R && this.current) {
                    this.$parent.$options.methods.fetchData(
                         '', 'PATCH', { uid: this.current.uid }
                    );
                    const old = this.current;
                    if (next || prev) {
                        this.moveTo(next || prev);
                    }
                    delete this.Items[old.uid];
                }
            }
        },
        moveTo(uid) {
            this.$set(this.current, 'active', false);
            this.$set(this.Items, this.current.uid, this.current);
            this.current = this.Items[uid];
            this.$set(this.current, 'active', true);
            this.$set(this.Items, this.current.uid, this.current);
            this.Items = Object.assign({}, this.Items);
        }
    }
});