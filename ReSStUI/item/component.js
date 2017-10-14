/*jshint esversion: 6 */

window.ReSSt.item = Promise.resolve({
    data () {
        return {
            self: {},
            share: "",
            previous: null,
            next: null,
            category: "c",
            feed: '_',
            embedders: []
        };
    },
    created () {
        this.$parent.$on('WindowKeyUp', code => this.onNav(code));
        this.$on('RegisterEmbeder', this.registerEmbeder);
        this.$on('UnregisterEmbeder', this.unregisterEmbeder);
        this.loadItem();
    },
    watch: { '$route': 'loadItem' },
    methods: {
        loadItem (...args) {
            const methods = this.$parent.$options.methods;
            const load = methods.fetchData;
            const list = methods.getList() || {};
            const uid = this.$route.params.item;
            this.feed = this.$route.params.feed;
            const suffix = this.feed !== '_' ? `/this.feed` : '';
            this.category = this.$route.params.category;
            this.self = list[uid] || { uid };
            this.setNav(uid, list);
            this.$parent.$emit('BackTo', `#/feeds/${this.category}${suffix}`);
            if(!this.self.loaded){
                return load('uid=' + uid).then(body => {
                    load('', 'PATCH', { uid: uid });
                    if (this.self.uid === body.Items[0].uid) {
                        this.self = Object.assign({}, this.self, body.Items[0], {loaded: true});
                        this.setShare(this.self.link);
                    }
                    this.$parent.$emit('BeforeShowItem', this.self);
                    this.self = this.self;
                    this.$parent.$emit('ItemView', this);
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
            const feed = this.feed ? this.feed : '_';
            const path = `#/feeds/${this.category}/${feed}`;
            if (prev) {
                this.previous = `${path}/${prev}`; 
            } else {
                this.previous = null;
            }
            const next = keys[uidIndex + 1];
            if (next){
                this.next = `${path}/${next}`;
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
                } else if (this.self && code === O) {
                    console.log(this.self);
                    window.open(this.self.link, this.self.uid);
                }
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
});