/*jshint esversion: 6 */

window.ReSSt.cat = window.ReSSt
    .mapState('feeds', 'backto')
    .then(({get, set, fetchData}) => {
        return {
            data () {
                return {
                    loading: true,
                    self: {},
                    current: null,
                    empty: false
                };
            },
            computed: {
                uid () { return this.$route.params.category; },
                Items () { return get(this, 'feeds'); }
            },
            created () {
                this.loadFeeds();
                this.$root.$off('WindowKeyUp');
                this.$root.$on('WindowKeyUp', code => {
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
                    set(this, 'backto', '#/feeds');
                    fetchData({ state : this.$store.state }, `uid=${this.uid}`).then(body => {
                        this.self = body.Items[0]; 
                    });
                    const unread = get(this, 'showReaded') ? '' : '&unread=1';
                    fetchData({ state : this.$store.state }, `tree=${this.uid}${unread}`).then(body => {
                        let items = [];
                        for (const item of body.Items) {
                            items = item.Items && items.concat(item.Items) || items;
                        }
                        this.current = items[0];
                        this.$store.commit('set_feedItems', { 
                            uid: this.uid,
                            items: items.slice(0,100).filter(i => i).reduce((r, v) => { r[v.uid] = v; return r; }, { })
                        });
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
                        fetchData({ state : this.$store.state },
                            '', 'PATCH', { uid: this.current.uid }
                        );
                        const old = this.current;
                        if(!get(this, 'showReaded')) this.$store.dispatch('delete_item', { feedUid: this.uid, uid: old.uid });
                        this.moveTo(this.getNext() || this.getNext(-1));
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
        };
    });
