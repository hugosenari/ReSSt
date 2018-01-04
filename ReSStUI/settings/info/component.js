/*jshint esversion: 6 */
window.ReSSt.settings.info = window.ReSSt
    .mapState('showReaded')
    .then(() => (
        { 
            data () {
                return {
                    time_to_run: window.APP_START_TIME || ''
                };
            },
            created () {
                setTimeout(()=> {
                    this.time_to_run = window.APP_START_TIME;
                }, 5000);
            }
        }
    ));
