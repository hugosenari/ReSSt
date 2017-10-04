/*jshint esversion: 6 */
const ReSSt = { data: {} };
const ROOT = '/';
window.ReSSt = ReSSt;
const loaded = (name) => new Promise(resolve => {
    const hasRessource = () => {
        if (window[name]) {
            resolve(window[name]);
        } else {
            setTimeout(hasRessource, 10);
        }
    };
    hasRessource();
});

const loadComponent = (name, path = '', namespace = ReSSt) => {
    const tp = fetch(`${path}${name}/component.html`).then(response => response.text());
    const js = fetch(`${path}${name}/component.js`).then(responde => responde.text())
        .then(js => {
            eval(js);
            const component = namespace[name];
            const error = new Error("Can't load component " + name);
            return component || Promise.reject(error);
        });
    const promise = Promise.all([tp, js]).then(([template, component]) => {
        component.template = template;
        return component;
    });
    return () => promise;
};
window.ReSSt.loadComponent = loadComponent;

const route = ({name, path}) => ({
    name: 'ReSSt.' + name,
    path: path || '/' + name,
    component: loadComponent(name)
});
const componentNames = ['settings', 'feeds'];
const routes = componentNames.map(name => route({ name }))
    .concat([
        route({ name: 'home', path: '/' }),
        route({ name: 'cat',  path: '/feeds/:category'}),
        route({ name: 'feed', path: '/feeds/:category/:feed'}),
        route({ name: 'item', path: '/feeds/:category/:feed/:item'})
    ]);

const App = {
    el: '#app',
    data () {
        return {
            transitionName: 'fade',
            backTo: null
        };
    },
    created () {
        this.$on('BackTo', this.setBackTo);
        window.addEventListener('keyup', event => {
            if (event.keyCode) {
                this.$emit('WindowKeyUp', event.keyCode, event);
            }
        });
    },
    components: {
        'resstplugins':  window.ReSSt.loadComponent('plugin')
    } ,
    methods: {
        fetchData (params='', method='GET', body=null) {
            const key = localStorage.getItem('api_key');
            const endpoint = localStorage.getItem('api_endpoint');
            const headers = new Headers();
            headers.append('x-api-key', key);
            headers.append('Content-Type', 'application/json');
            const options = {
                method: method,
                headers,
                mode: 'cors',
                cache: 'default'
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            return fetch(endpoint + '/ReSStCRUD?' + params, options)
            .then(
                (response) => {
                    return response.json();
                }
            );
        },
        getList() { return ReSSt.data.list; },
        setList(values=[]) {
          ReSSt.data.list = {};
          for (const item of values) {
              item.active = false;
              ReSSt.data.list[item.uid] = item;
          }
          return ReSSt.data.list;
        },
        setBackTo(address) {
            this.backTo = address;
        }
    }
};

loaded('Vue').then(Vue => {
    loaded('VueMaterial').then(VueMaterial => {
        Vue.use(window.VueMaterial);
        loaded('VueRouter').then(VueRouter => {
            Vue.use(VueRouter);
            const router = new VueRouter({ routes });
            router.beforeEach((to, fron, next) => {
                const token = localStorage.getItem('api_key') && localStorage.getItem('api_endpoint');
                const path = to.path;
                let newPath = token ? undefined : ROOT;
                newPath = path === ROOT && token ? '/feeds' : newPath;
                return newPath !== path ? next(newPath) : next();
            });
            return router;
        }).then(router => {
            App.router = router;
            ReSSt.App = new window.Vue(App);
        });
    });
});
