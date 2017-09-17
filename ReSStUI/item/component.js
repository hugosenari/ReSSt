/*jshint esversion: 6 */

window.ReSSt.item = Promise.resolve({
    data () {
        return {
            self: {}
        };
    },
    created () { this.loadItem(); },
    watch: { '$route': 'loadItem' },
    methods: {
        loadItem () {
            const uid = this.$route.params.item;
            const load = this.$parent.$options.methods.fetchData;
            return load('uid=' + uid).then(body => {
                this.self = body.Items[0];
                return this.self;
            }).then(() => {
                load('', 'PATCH', { uid: uid })
                    .then((body)=>{});
            });
        },
    }
});