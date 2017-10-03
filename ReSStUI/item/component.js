/*jshint esversion: 6 */

window.ReSSt.item = Promise.resolve({
    data () {
        return {
            self: {},
            share: "",
            previous: null,
            next: null,
            category: "c",
            feed: '_'
        };
    },
    created () {
        this.loadItem();
        this.$parent.$on('WindowKeyUp', code => this.onNav(code));
    },
    watch: { '$route': 'loadItem' },
    methods: {
        loadItem (...args) {
            const uid = this.$route.params.item;
            this.category = this.$route.params.category;
            this.feed = this.$route.params.feed;
            this.feed = this.feed !== '_' ? this.feed : '';
            const methods = this.$parent.$options.methods;
            const list = methods.getList() || {};
            const load = methods.fetchData;
            this.self = list[uid] || {};
            this.setNav(uid, list);
            this.$parent.$emit('BackTo', `#/feeds/${this.category}/${this.feed}`);
            if(!this.self.loaded){
                return load('uid=' + uid).then(body => {
                    load('', 'PATCH', { uid: uid });
                    if (this.self.uid === body.Items[0].uid) {
                        this.self = Object.assign({}, this.self, body.Items[0], {loaded: true});
                        this.setShare(this.self.link);
                    }
                    return this.self;
                });
            }
        },
        setShare (link) {
            const encoded = encodeURIComponent(link);
            const params = [
                'intent:#Intent',
                'action=android.intent.action.SEND',
                'type=text/plain',
                'S.android.intent.extra.TEXT=' + encoded,
                'end'
            ];
            this.share = params.join(';'); 
        },
        setNav (uid, list) {
            const keys = Object.keys(list);
            const uidIndex = keys.indexOf(uid);
            const prev = keys[uidIndex - 1];
            if (prev) {
                this.previous = prev && `#/feeds/${this.category}/${this.self.parent}/${prev}`; 
            } else {
                this.previous = null;
            }
            const next = keys[uidIndex + 1];
            if (next){
                this.next = `#/feeds/${this.category}/${this.self.parent}/${next}`;
            } else {
                this.next = null;
            }
        },
        onNav(code) {
            if (this.$route.name === 'ReSSt.item'){
                const LEFT = 37;
                const RIGHT = 39;
                const O = 79;
                if(code === LEFT && this.previous) {
                    this.$parent.$router.push({ path: this.previous.replace('#', '')});
                } else if (code === RIGHT && this.next) {
                    this.$parent.$router.push({ path: this.next.replace('#', '')});
                } else if (code === O) {
                    window.open(this.link, this.uid);
                }
            }
        }
    }
});