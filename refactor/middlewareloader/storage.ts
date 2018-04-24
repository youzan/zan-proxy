import { LocalStorage } from 'node-localstorage';
import { isString } from 'lodash';
const key = 'custom-middlewares'
export default class Storage {
    store;
    constructor(path = __dirname) {
        this.store = new LocalStorage(path);
    }
    get() {
        let middlewares = this.store.getItem(key) || [];
        if (isString(middlewares)) {
            middlewares = JSON.parse(middlewares)
        }
        return middlewares;
    }
    set(value) {
        return this.store.setItem(key, JSON.stringify(value));
    }
}