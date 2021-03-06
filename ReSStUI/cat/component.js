/*jshint esversion: 6 */

window.ReSSt.cat = window.ReSSt
    .mapState('feeds', 'backto', 'showReaded')
    .then(({get, set, fetch, patchAs}) => {
        return {
            data () {
                return {
                    loading: true,
                    nextPage: null,
                    selected: 0
                };
            },
            computed: {
                self () {
                    const categories = get('categories') || [];
                    const [self] = categories.filter(c => c.uid === this.uid);
                    return self || {};
                },
                uid () { return this.$route.params.category; },
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
            beforeRouteEnter (to, from, next) {
                next(vm => vm.loadFeeds() || next() );
            },
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
                    patchAs(`uid=${this.uid}`).then(body => { this.self = body.Items[0]; });
                    const unread = get('showReaded') ? '' : '&unread=1';
                    patchAs(`tree=${this.uid}${unread}&Limit=40`).then(body => {
                        const items = (body.Items || [])
                            .reduce((r, v) => r.concat(v.Items || []), [])
                            .filter(i => i)
                            .slice(0, 40)
                            .reduce((r, v) => Object.assign(r, {[v.uid]: v}), { })
                        this.$store.commit('set_feedItems', { uid: this.uid, items });
                        this.loading = false;
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
                    } else {
                        this.loadFeeds();
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
