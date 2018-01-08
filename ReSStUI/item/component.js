/*jshint esversion: 6 */

window.ReSSt.item = window.ReSSt
    .mapState('feeds', 'backto')
    .then(({get, set, fetch, patchAs}) => {
        return {
            data () {
                return {
                    self: {},
                    share: '',
                    previous: null,
                    next: null,
                    embedders: []
                };
            },
            computed: {
                uid () { return this.$route.params.item; },
                feed () { return this.$route.params.feed; },
                category () { return this.$route.params.category; },
                parentUid () { return this.feed != '_' ? this.feed : this.category; },
                allItems () { return get('feeds') || {}; },
                items () { return this.allItems[this.parentUid] || {}; },
                cachedSelf () { return this.items[this.uid] || { uid: this.uid} }
            },
            created () {
                this.$root.$off('WindowKeyUp');
                this.$root.$on('WindowKeyUp', code => this.onNav(code));
                this.$on('RegisterEmbeder', this.registerEmbeder);
                this.$on('UnregisterEmbeder', this.unregisterEmbeder);
                this.loadItem();
            },
            watch: { '$route': 'loadItem' },
            methods: {
                loadItem (...args) {
                    this.setBack();
                    this.setNav();
                    this.self = this.cachedSelf;
                    if(!this.self.loaded){
                        return patchAs('uid=' + this.uid).then(body => {
                            fetch('', 'PATCH', { uid: this.uid });
                            if (this.self.uid === body.Items[0].uid) {
                                this.$root.$emit('BeforeShowItem', body.Items[0]);
                                this.self = Object.assign({}, this.self, body.Items[0], {loaded: true});
                                this.$root.$emit('ItemView', this);
                            }
                        });
                    }
                },
                setBack () {
                    const suffix = this.feed !== '_' ? `/${this.feed}` : '';
                    set('backto', `#/feeds/${this.category}${suffix}`);
                    return get('bakcto');
                },
                setNav () {
                    const keys = Object.keys(this.items);
                    const uidIndex = keys.indexOf(this.uid);
                    const prev = keys[uidIndex - 1];
                    const next = keys[uidIndex + 1];
                    const path = `#/feeds/${this.category}/${this.feed}`;
                    this.previous = prev ? `${path}/${prev}` : null;
                    this.next = next ? `${path}/${next}`: null;
                },
                onNav(code) {
                    const LEFT = 37;
                    const RIGHT = 39;
                    const O = 79;
                    if(code === LEFT && this.previous) {
                        this.$root.$router.push({ path: this.previous.replace('#', '')});
                    } else if (code === RIGHT && this.next) {
                        this.$root.$router.push({ path: this.next.replace('#', '')});
                    } else if (this.self && code === O) {
                        window.open(this.self.link, this.self.uid);
                    }
                },
                registerEmbeder (embeder) {
                    if (this.embedders.every(component => component.name !== embeder.name)){
                        this.embedders.push(embeder);
                    }
                },
                unregisterEmbeder (embeder) {
                    this.embedders = this.embedders.filter(component => component.name !== embeder.name);
                }
            }
        };
    });
