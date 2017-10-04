/*jshint esversion: 6 */

(() => {
  let enabled = false;
  const app = window.ReSSt.App;
  const name = 'blank';
  const replace = val => val.replace(/(href="[^"]+")/gi, '$1 target="_blank"');
  app.$on('PluginEnabled', n => n === name && (enabled = true));
  app.$on('PluginDisabled', n => n === name && (enabled = false));
  app.$on('BeforeShowItem', item => {
    if (enabled) {
      item.summary = replace(item.summary);
      for (const i of item.content.keys()) {
        item.content[i] = replace(item.content[i]);
      }
    }
    return item;
  });
  app.$emit('PluginReady', 'blank');
})();
