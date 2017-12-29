/*jshint esversion: 6 */

(() => {
    window.ReSSt.plugin.embedComponent({
        name: 'chicken',
        component: {
            name: 'plugin-chicken',
            template: '<div v-html="chiken"></div>',
            props: ['text'],
            created () {
                fetch('./plugins/chicken.html')
                .then(response => response.text())
                .then(text => {this.chiken = text;});
            },
            data () { return { chiken: ''} },
        }
    });
})();
