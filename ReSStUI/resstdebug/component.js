/*jshint esversion: 6 */
window.ReSSt.resstdebug = window.ReSSt
.mapState('showReaded')
.then(() => (
    { 
        data () {
            return {
                times_to_run: {},
                timing: {},
                show_time: false
            };
        },
        created () {
            setTimeout(()=> {
                this.times_to_run = window.APP_START_TIMES;
                const timing = JSON.parse(JSON.stringify(window.performance.timing));
                this.timing = Object.keys(timing).reduce((o, k)=> {
                    o[k] = timing[k] ? timing[k] - timing.navigationStart : 0;
                    return o;
                }, {});
                this.show_time = true;
            }, 5000);
        }
    }
));