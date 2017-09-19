/*jshint esversion: 6 */

window.ReSSt.cat = Promise.resolve({
    data () {
        return {
            loading: true,
            self: {},
            current: null,
            Items: {},
            empty: false
        };
    },
    created () {
        this.loadFeeds();
        this.$parent.$on('WindowKeyUp', code => this.onNav(code));
    },
    watch: { '$route': 'loadFeeds' },
    methods: {
        loadFeeds () {
            const uid = this.$route.params.category;
            const methods = this.$parent.$options.methods;
            const load = methods.fetchData;
            const setList = methods.setList;
            this.$parent.$emit('BackTo', `#/feeds`); 
            load('uid=' + uid).then(body => {
                this.self = body.Items[0];
            });
            return load(`tree=${uid}&unread=1`)
                .then(body => {
                    let items = [];
                    for (const item of body.Items) {
                        items = items.concat(item.Items);
                    }
                    this.current = items[0];
                    this.Items = setList(items) || {};
                    if (this.current) {
                        this.current.active = true;
                    } else {
                        this.loading = false;
                        this.empty = true;
                    }
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
