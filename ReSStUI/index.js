/*jshint esversion: 6 */
(()=>{
const DEBUG = window.location.toString().includes('debug=1');
const ReSSt = { data: {} };
window.ReSSt = ReSSt;
const ROOT = '/';
const loadingModules = {};
const loaded = (name) => new Promise(resolve => {
    const hasRessource = () => window[name] ? resolve(window[name]) : setTimeout(hasRessource, 30);
    hasRessource();
});
const vueUse = (Vue, ...names) => {
    const results = [Vue];
    for (const name of names) {
        const result = loaded(name).then(o => { Vue.use(o); return o; });
        results.push(result);
    }
    return Promise.all(results);
};
const waitVue = (...names) => loaded('Vue').then(Vue => vueUse(Vue, ...names));
const loadCodeFromCache = window.loadCodeFromCache;
const loadComponent = (name, path = '', namespace = ReSSt) => {
    const tp = loadCodeFromCache(`${path}${name}/component.html`);
    const js = loadCodeFromCache(`${path}${name}/component.js`).then((js) => {
        window.evaluate(js);
        return namespace[name];
    });
    const promise = Promise.all([tp, js]).then(([template, component]) => {
        component.template = template.text;
        return component;
    });
    return () => promise;
};
const save = (key, val) => localStorage.setItem(key, val);
const saveString = (key, val) => save(key, JSON.stringify(val));
const read = (key, or = '') => localStorage.getItem(key) || or;
const readObj = (key, or = '{}') => {
    try {
        return JSON.parse(read(key, or) || or);
    } catch (e) {
        console.log(e, read(key, or));
    }
}
const setter = (obj, key, val) => { Vue.set(obj, key, val); save(key, val); };
const setterObj = (obj, key, val) => { Vue.set(obj, key, val); saveString(key, val);};
const fetchData = ({ state, mode = 'cors', cache = 'default', header = {}}, params='', method='GET', body=null ) => {
    const { key, endpoint } = state || ReSSt.App.$store.state;
    const headers = new Headers();
    headers.append('X-Api-Key', key);
    for (const k of Object.keys(header)) {
        headers.append(k, header[k]);
    }
    const options = { method, headers, mode, cache };
    if (body) options.body = JSON.stringify(body);
    return fetch(endpoint + '/ReSStCRUD?' + params, options).then(response => response.json());
};
const lib = (obj = {}) => {
    return Promise.all([loaded('Vue'), loaded('Vuex')]).then(
        ([Vue, Vuex]) => {
            obj.DEBUG = DEBUG;
            obj.Vue = Vue;
            obj.Vuex = Vuex;
            obj.app = () => ReSSt.App;
            obj.loadCodeFromCache = loadCodeFromCache;
            obj.loadComponent = loadComponent;
            obj.fetchData = fetchData;
            obj.fetch = (params='', method='GET', body=null, opts={}) => 
                fetchData(opts, params, method, body);
            obj.patchAs = (params='', method='GET', opts={}) =>{
                body = params.split('&').reduce((b, i)=> {
                    const [k, v] = i.split('=');
                    b[k] = v;
                    return b;
                }, {});
                opts['header'] = Object.assign({}, opts['header'], {'x-method': method});
                return fetchData(opts, '', 'PATCH', body);
            };
            return obj;
        }
    );
};
const mapState = (...args) => lib().then(l => {
    const getters = l.Vuex.mapState(args);
    for(const k of args) {
        l[k] = {
            get: getters[k],
            set: function(val) { l.app().$store.commit(`set_${k}`, val); },
        }
    }
    l.set = (attr, val) => l.app().$store.commit(`set_${attr}`, val);
    l.get = (attr) => l.app().$store.state[attr];
    return l;
});
window.ReSSt.lib = lib;
window.ReSSt.mapState = mapState;    
const Store = {
    state: {
        endpoint: read('endpoint'),
        key: read('key'),
        backto: '',
        showReaded: read('showReaded') === 'true',
        pluginsAutoPlay: read('pluginsAutoPlay') === 'true',
        plugins: readObj('plugins', '{}'),
        feeds: readObj('feeds', '{}'),
        categories: readObj('categories', '[]')
    },
    mutations: {
        set_backto: (state, backto) => setter(state, 'backto', backto),
        set_endpoint: (state, endpoint) => setter(state, 'endpoint', endpoint),
        set_key: (state, key) => setter(state, 'key', key),
        set_showReaded: (state) => setter(state, 'showReaded', !state.showReaded),
        set_plugins: (state, plugins) => setterObj(state, 'plugins', plugins),
        set_pluginsAutoPlay: (state) => setter(state, 'pluginsAutoPlay', !state.pluginsAutoPlay),
        set_feedItems: (state, { uid, items }) => {
            const feeds = state.feeds || {};
            Vue.set(feeds, uid, items);
            setterObj(state, 'feeds', feeds);
        },
        set_categories: (state, categories) => setterObj(state, 'categories', categories)
    },
    actions: {
        delete_item: ({ state, commit }, { feedUid, uid }) => {
            const items = state.feeds[feedUid];
            delete items[uid];
            commit('set_feedItems', { uid: feedUid, items });
        }
    }
};
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
            debugme: DEBUG
        };
    },
    computed: {
        backto: { get () { return this.$store.state.backto; } }},
    created () {
        window.addEventListener('keyup', event => {
            if (event.keyCode) {
                this.$emit('WindowKeyUp', event.keyCode, event);
            }
        });
    },
    components: {
        'resstplugins':  loadComponent('plugin'),
        'resstdebug':  loadComponent('resstdebug')
    } ,
};

const routeLogic = (to, fron, next) => {
    const token = App.store.state.key && App.store.state.endpoint;
    let newPath = token ? undefined : ROOT;
    newPath = to.path === ROOT && token ? '/feeds' : newPath;
    return newPath !== to.path ? next(newPath) : next();
};

waitVue('VueRouter', 'VueMaterial')
.then(([Vue, VueRouter]) => loaded('Vuex'))
.then(Vuex => [Vue, VueRouter, Vuex])
.then(([Vue, VueRouter, Vuex])=> {
    App.store = new Vuex.Store(Store);
    App.router = new VueRouter({ routes });
    App.router.beforeEach(routeLogic);
    ReSSt.App = new Vue(App);
});

})();