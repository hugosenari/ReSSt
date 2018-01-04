/*jshint esversion: 6 */

window.ReSSt.feed = window.ReSSt
    .mapState('feeds', 'backto', 'showReaded')
    .then(({get, set, fetch}) => {
        return {
            data () {
                return {
                    loading: true,
                    self: {},
                    nextPage: null,
                    selected: 0
                };
            },
            computed: {
                uid () { return this.$route.params.feed; },
                myItems () {
                    const feeds = get('feeds') || {};
                    const items = feeds[this.uid] || {};
                    this.$store.commit('set_feedItems', { uid: this.uid, items });
                    return get('feeds')[this.uid];
                },
                keys () { return Object.keys((get('feeds') || {})[this.uid] || {}); },
                currentKey () { return Object.keys((get('feeds') || {})[this.uid] || {})[this.selected]; },
                current () { return this.myItems[this.currentKey]; },
                empty () { return !this.loading && !this.current; }
            },
            created () { this.loadFeeds(); },
            watch: { '$route': 'loadFeeds' },
            methods: {
                registerKeys () {
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
                loadFeeds () {
                    this.registerKeys();
                    set('backto', '#/feeds');
                    fetch(`uid=${this.uid}`).then(body => { this.self = body.Items[0]; });
                    const unread = get('showReaded') ? '' : '&unread=1';
                    const query = this.$route.query; 
                    const last = query.last ? `&last=${query.last.replace(/{*}*/g, '')}` : '';
                    return fetch(`parent=${this.uid}${unread}${last}&sort=1&Limit=40`)
                        .then(body => {
                            const items = (body.Items || [])
                                .filter(i => i)
                                .slice(0, 40)
                                .reduce((r, v) => { r[v.uid] = v; return r; }, { });
                            this.$store.commit('set_feedItems', { uid: this.uid, items });
                            this.nextPage = body.LastEvaluatedKey;
                            if (!this.keys.length && this.nextPage) {
                                this.$router.push({ query: { last: JSON.stringify(this.nextPage) }});
                            } else {
                                this.loading = false;
                            }
                        });
                },
                openItem() {
                    this.current &&
                    this.current.link &&
                    window.open(this.current.link, this.current.uid);
                },
                getNext(x = 1) { return this.keys[this.selected + x]; },
                markAsRead() {
                    if (this.current) {
                        fetch('', 'PATCH', { uid: this.current.uid });
                        if(!get('showReaded')){
                            this.$store.dispatch(
                                'delete_item',
                                { feedUid: this.uid, uid: this.current.uid }
                            );
                        }
                        this.$forceUpdate();
                        if(this.selected) {
                            this.moveTo(this.getNext(-1));
                            this.moveTo(this.getNext());
                        } else {
                            this.moveTo(this.getNext());
                            this.moveTo(this.getNext(-1));
                        }
                    }
                },
                nextItem() { this.moveTo(this.getNext()); },
                prevItem() { this.moveTo(this.getNext(-1)); },
                moveTo(uid) {
                    if (!uid) return;
                    let newIndex = this.keys.findIndex((i) => i === uid);
                    newIndex = newIndex < this.keys.length ? newIndex : this.keys.length - 1;
                    newIndex = newIndex >= 0 ? newIndex : 0
                    this.selected = newIndex;
                }
            }
        };
    });
