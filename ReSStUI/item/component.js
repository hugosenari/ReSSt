/*jshint esversion: 6 */

window.ReSSt.item = Promise.resolve({
    data () {
        return {
            self: {},
            share: "",
            previous: null,
            next: null,
            category: "c"
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
            const methods = this.$parent.$options.methods;
            const list = methods.getList() || {};
            const load = methods.fetchData;
            this.self = list[uid] || {};
            this.setNav(uid, list);
            this.$parent.$emit('BackTo', `#/feeds/${this.category}/${this.self.parent}`);
            if(!this.self.loaded){
                return load('uid=' + uid).then(body => {
                    this.self = Object.assign({}, this.self, body.Items[0], {loaded: true});
                    this.setShare(this.self.link);
                    load('', 'PATCH', { uid: uid });
                    return this.self;
                });
            }
        },
        setShare (link) {
            const encoded = encodeURI(link);
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
                this.previous = prev &&`#/feeds/${this.category}/${this.self.parent}/${prev}`; 
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
            const LEFT = 37;
            const RIGHT = 39;
            if (this.$route.name === 'ReSSt.item'){
                if(code === LEFT && this.previous) {
                    this.$parent.$router.push({ path: this.previous.replace('#', '')});
                } else if (code === RIGHT && this.next) {
                    this.$parent.$router.push({ path: this.next.replace('#', '')});
                }
            }            
        }
    }
});