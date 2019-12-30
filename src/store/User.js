export default {
    state: {
        user: null
    },

    mutations: {
        setUser (state, user) {
            state.user = user;
        }
    },

    actions: {
        storeUser ({commit}, user) {
            commit('setUser', user);
        },
        removeUser ({ commit }) {
            commit('setUser', null);
        }
    }
};