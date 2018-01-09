/*jshint esversion: 6 */
window.ReSSt.resstdebug = window.ReSSt
.mapState('showReaded')
.then(() => (
    { 
        data () {
            return {
                times_to_run: window.APP_START_TIMES || {}
            };
        },
        created () {
            setTimeout(()=> {
                times_to_run = window.APP_START_TIMES;
            }, 5000);
        }
    }
));