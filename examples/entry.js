/*
 * @Author: your name
 * @Date: 2020-04-21 15:40:02
 * @LastEditTime: 2020-04-24 09:41:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /element/examples/entry.js
 */
import Vue from 'vue';
import jquery from 'jquery';
import entry from './app';
import VueRouter from 'vue-router';
import Element from 'main/index.js';
import 'packages/theme-chalk/src/index.scss';
import routes from './route.config';
import demoBlock from './components/demo-block.vue';
import MainFooter from './components/footer.vue';
import MainHeader from './components/header.vue';
import SideNav from './components/side-nav';
import FooterNav from './components/footer-nav';
import title from './i18n/title.json';
import emitter from './assets/scripts/emitter';
import Eaglesoft from './assets/scripts/eaglesoft';
import EgDialog from './assets/scripts/egDialog';

Vue.use(Element, {
  btnDirection: 'row-reverse'
});
Vue.use(VueRouter);
Vue.use(Eaglesoft);
Vue.use(EgDialog);
Vue.component('demo-block', demoBlock);
Vue.component('main-footer', MainFooter);
Vue.component('main-header', MainHeader);
Vue.component('side-nav', SideNav);
Vue.component('footer-nav', FooterNav);

Vue.prototype.$emitter = emitter;

const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes
});

router.afterEach(route => {
  const data = title[route.meta.lang];
  for (let val in data) {
    if (new RegExp('^' + val, 'g').test(route.name)) {
      document.title = data[val];
      return;
    }
  }
  document.title = 'Element';
});
window.$ = jquery;

new Vue({ // eslint-disable-line
  render: h => h(entry),
  router
}).$mount('#app');
