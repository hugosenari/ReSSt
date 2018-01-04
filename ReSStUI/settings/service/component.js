/*jshint esversion: 6 */
window.ReSSt.settings.service = window.ReSSt
    .mapState('key', 'endpoint', 'showReaded')
    .then(computed => (
        { 
            data () {
                return {
                    time_to_run: new Date().getTime() - window.APP_START_TIME
                };
            },
            computed
        }
    ));
