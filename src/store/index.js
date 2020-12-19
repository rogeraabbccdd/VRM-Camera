import Vue from 'vue'
import Vuex from 'vuex'
import { LocalStorage } from 'quasar'
import createPersistedState from 'vuex-persistedstate'

import settings from './settings'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      settings
    },
    plugins: [
      createPersistedState({
        paths: [
          'settings.lang'
        ],
        storage: {
          getItem: key => LocalStorage.getItem(key),
          setItem: (key, value) => LocalStorage.set(key, value),
          removeItem: key => LocalStorage.remove(key)
        }
      })
    ]
    // enable strict mode (adds overhead!)
    // for dev mode only
    // strict: process.env.DEV
  })

  /*
    if we want some HMR magic for it, we handle
    the hot update like below. Notice we guard this
    code with "process.env.DEV" -- so this doesn't
    get into our production build (and it shouldn't).
  */
  if (process.env.DEV && module.hot) {
    module.hot.accept(['./settings'], () => {
      const newSettings = require('./settings').default
      Store.hotUpdate({ modules: { settings: newSettings } })
    })
  }

  return Store
}
