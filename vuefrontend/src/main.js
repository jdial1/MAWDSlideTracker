import Vue from 'vue'
import App from './App.vue'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { BootstrapVue, BootstrapVueIcons, BVToastPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@fortawesome/fontawesome-free/css/all.css'
// import * as io from 'socket.io-client';
import VueSocketIO from 'vue-socket.io'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(BVToastPlugin);

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(VueRouter);
Vue.use(VueAxios, axios);

let backendIP = "http://localhost:2082";

let env = process.env.NODE_ENV || "development";

if (env == "production") {
  backendIP = "http://10.24.4.9:2081";
} else if (env == "test") {
  backendIP = "http://10.24.4.9:2082";
}

let connectObj = {
  local: "http://localhost:8001",
  backend: backendIP,
};

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: connectObj.local,
    vuex: {
      store,
      actionPrefix: "local_",
      mutationPrefix: "local_",
    },
  })
);

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: connectObj.backend,
    vuex: {
      store,
      actionPrefix: "backend_",
      mutationPrefix: "backend_",
    },
  })
);

const router = new VueRouter({ routes });

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
