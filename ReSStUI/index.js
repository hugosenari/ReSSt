/*jshint esversion: 6 */
const ReSSt = { data: {} };
window.ReSSt = ReSSt;
const Vue = window.Vue;
const VueRouter = window.VueRouter;
const VueMaterial = window.VueMaterial;
Vue.use(VueMaterial);
Vue.use(VueRouter);
const ROOT = '/';

const loadComponent = name => () => {
    const tp = fetch(name + '/component.html').then(response => response.text());
    const js = fetch(name + '/component.js').then(responde => responde.text())
        .then(js => { 
            eval(js);
            const component = ReSSt[name];
            const error = new Error("Can't load component " + name); 
            return component || Promise.reject(error); 
        });
    return Promise.all([tp, js]).then(([template, component]) => {
        component.template = template; 
        return component;
    });
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
const router = new VueRouter({ routes });
router.beforeEach((to, fron, next) => {
    const token = localStorage.getItem('api_key');
    const path = to.path;
    let newPath = token ? undefined : ROOT;
    newPath = path === ROOT && token ? '/feeds' : newPath;
    return newPath !== path ? next(newPath) : next();
});

ReSSt.App = new window.Vue({
    router,
    el: '#app',
    data () {
        return {
            transitionName: 'fade'
        };
    },
    methods: {
        goBack (n=-1) {
            this.$router.go(n);
        }
    }
});