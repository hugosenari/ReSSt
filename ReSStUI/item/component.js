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
    created () { this.loadItem(); },
    watch: { '$route': 'loadItem' },
    methods: {
        loadItem () {
            const uid = this.$route.params.item;
            this.category = this.$route.params.category;
            const methods = this.$parent.$options.methods;
            const list = methods.getList() || {};
            const load = methods.fetchData;
            this.self = list[uid] || {};
            this.setNav(uid, list);
            this.$parent.$emit('BackTo', `#/feeds/c/${this.self.parent}`);
            if(!this.self.loaded){
                return load('uid=' + uid).then(body => {
                    Object.assign(this.self, body.Items[0], {loaded: true});
                    this.setShare(this.self.link);
                    return this.self;
                }).then(() => {
                    load('', 'PATCH', { uid: uid })
                        .then((body)=>{});
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
        }
    }
});