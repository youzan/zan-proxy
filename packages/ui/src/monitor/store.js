import { Store } from 'vuex'

export function createStore(link) {
  return new Store({
    state: {
      list: [],
      map: { },
      keyword: ''
    },
    actions: {
      
    },
    mutations: {
      clean(state) {
        state.list = []
        state.map = { }
      },
      keywordChange(state, value) {
        state.keyword = value
      }
    },
    getters: {
      count() {
        
      }
    }
  })
}
