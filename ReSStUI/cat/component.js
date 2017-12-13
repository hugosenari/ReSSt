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
        this.$parent.$off('WindowKeyUp');
        this.$parent.$on('WindowKeyUp', code => {
            const LEFT = 37;
            const RIGHT = 39;
            const O = 79;
            const R = 82;
            if (code === RIGHT) return this.nextItem();
            if (code === LEFT) return this.prevItem();
            if (code === O) return this.openItem();
            if (code === R) return this.markAsRead();
        });
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
            const show_readed = localStorage.getItem('show_readed');
            const unread = show_readed === 'true' ? '' : '&unread=1'; 
            return load(`tree=${uid}${unread}`)
                .then(body => {
                    let items = [];
                    for (const item of body.Items) {
                        items = item.Items && items.concat(item.Items) || items;
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
        openItem() {
            if (this.current && this.current.link)
                window.open(this.current.link, this.current.uid);
        },
        getNext(x = 1) {
            const keys = Object.keys(this.Items || {});
                const uidIndex = this.current && keys.indexOf(this.current.uid) || 0;
            return keys[uidIndex + x];
        },
        markAsRead() {
            if (this.current) {
                    this.$parent.$options.methods.fetchData(
                         '', 'PATCH', { uid: this.current.uid }
                    );
                    const old = this.current;
                this.moveTo(this.getNext() || this.getNext(-1));
                    delete this.Items[old.uid];
            }
        },
        nextItem() { this.moveTo(this.getNext()); },
        prevItem() { this.moveTo(this.getNext(-1)); },
        moveTo(uid) {
            if (!uid) return;
            this.$set(this.current, 'active', false);
            this.$set(this.Items, this.current.uid, this.current);
            this.current = this.Items[uid];
            this.$set(this.current, 'active', true);
            this.$set(this.Items, this.current.uid, this.current);
            this.Items = Object.assign({}, this.Items);
        }
    }
});
