/*jshint esversion: 6 */

window.ReSSt.feed = Promise.resolve({
    data () {
        return {
            loading: true,
            self: {},
            current: null,
            Items: {},
            empty: false,
            nextPage: null
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
            load('uid=' + uid).then(body => { this.self = body.Items[0]; });
            const show_readed = localStorage.getItem('show_readed');
            const unread = show_readed === 'true' ? '' : '&unread=1';
            const last = this.$route.query.last ? `&last=${this.$route.query.last.replace(/{*}*/g, '')}` : '';
            return load(`parent=${uid}${unread}${last}&sort=1`)
                .then(body => {
                    const items = body.Items;
                    this.current = items[0];
                    this.Items = setList(items) || {};
                    this.empty = !this.current;
                    if (this.current) {
                        this.current.active = true;
                    }
                    this.loading = false;
                    this.nextPage = body.LastEvaluatedKey;
                    if (!items.length && this.nextPage) {
                        this.$router.push({ query: { last: JSON.stringify(this.nextPage) }});
                    }
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
