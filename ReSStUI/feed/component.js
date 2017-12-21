/*jshint esversion: 6 */

window.ReSSt.feed = window.ReSSt
    .mapState('feeds', 'backto', 'showReaded')
    .then(({set, get, fetchData}) => {
        return {
            data () {
                return {
                    loading: true,
                    self: {},
                    current: null,
                    empty: false,
                    nextPage: null,
                    uid: null,
                };
            },
            computed: {
                Items () {
                    return get(this, 'feeds')[this.uid] || {}
                }
            },
            created() {
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
                    this.uid = this.$route.params.feed;
                    set(this, 'backto', '#/feeds');
                    fetchData( { state : this.$store.state }, `uid=${this.uid}`)
                        .then(body => { this.self = body.Items[0]; });
                    const unread = get(this, 'showReaded') ? '' : '&unread=1';
                    const last = this.$route.query.last ? `&last=${this.$route.query.last.replace(/{*}*/g, '')}` : '';
                    return fetchData( { state : this.$store.state }, `parent=${this.uid}${unread}${last}&sort=1`)
                        .then(body => {
                            const items = body.Items;
                            this.$store.commit('set_feedItems', { 
                                uid: this.uid,
                                items: items.filter(i => i).reduce((r, v) => { r[v.uid] = v; return r; }, { })
                            } );
                            this.current = items[0];
                            if (this.current)  this.current.active = true;
                            this.nextPage = body.LastEvaluatedKey;
                            if (!items.length && this.nextPage) {
                                this.$router.push({ query: { last: JSON.stringify(this.nextPage) }});
                            } else {
                                this.loading = false;
                                this.empty = !this.current;
                            }
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
                        this.$store.commit('set_feedItems', { uid: this.uid, items: this.Items });
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
