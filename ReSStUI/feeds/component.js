/*jshint esversion: 6 */

window.ReSSt.feeds = Promise.resolve({
    data () {
        return {
            loading: true,
            categories: []
        };
    },
    created () { this.loadCategories(); },
    watch: { '$route': 'fetchData' },
    methods: {
        loadCategories () {
            return this.fetchData('tree=root')
                .then(body => {
                    this.categories = body.Items;
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
