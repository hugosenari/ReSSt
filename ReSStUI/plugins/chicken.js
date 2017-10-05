/*jshint esversion: 6 */

(() => {
    window.ReSSt.plugin.embedComponent({
        name: 'chicken',
        component: {
            name: 'plugin-chicken',
            template: '<div v-html="chiken"></div>',
            props: ['text'],
            created () {
                console.log(this.text);
                fetch('./plugins/chicken.html')
                .then(response => response.text())
                .then(text => {this.chiken = text;});
            },
            data () { return { chiken: ''} },
            watch: {
                text (val) {
                    console.log('val changed', val);
                }
            }
        }
    });
})();
