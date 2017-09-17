/*jshint esversion: 6 */

window.ReSSt.feed = Promise.resolve({
    data () {
        return {
            loading: true,
            self: {}
        };
    },
    created () { this.loadFeeds(); },
    watch: { '$route': 'fetchData' },
    methods: {
        loadFeeds () {
            const uid = this.$route.params.feed;
            this.fetchData('uid=' + uid).then(body => {
                const self = body.Items[0];
                self.Items = this.self.Items;
                this.self = self;
            });
            return this.fetchData('tree=' + uid)
                .then(body => {
                    this.self.Items = body.Items;
                    this.loading = false;
                });
        },
        fetchData (params='') {
            const key = localStorage.getItem('api_key');
            const endpoint = localStorage.getItem('api_endpoint');
            const headers = new Headers();
            headers.append('x-api-key', key);
            headers.append('Content-Type', 'application/json');
            const options = {
                method: 'GET',
                headers,
                mode: 'cors',
                cache: 'default'
            };
            return fetch(endpoint + 'ReSStCRUD?' + params, options)
                .then(
                    (response) => {
                        return response.json();
                    }
                );
        }
    }
});