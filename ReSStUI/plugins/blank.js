/*jshint esversion: 6 */

(() => {
  window.ReSSt.lib().then(({app}) => {
    let enabled = false;
    const name = 'blank';
    const replace = val => val && val.replace(/(href="[^"]+")/gi, '$1 target="_blank"');
    app().$on('PluginEnabled', n => n === name && (enabled = true));
    app().$on('PluginDisabled', n => n === name && (enabled = false));
    app().$on('BeforeShowItem', item => {
      if (enabled && item) {
        item.summary = replace(item.summary);
        if (item.content) {
          for (const i of item.content.keys()) {
            item.content[i] = replace(item.content[i]);
          }
        }
      }
      return item;
    });
    app().$emit('PluginReady', 'blank');
  });
})();
