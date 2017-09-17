/*jshint esversion: 6 */

window.ReSSt.feeds = Promise.resolve({
    beforeRouteUpdate (to, from, next) {
      // react to route changes...
      // don't forget to call next()
      next();
    }
});