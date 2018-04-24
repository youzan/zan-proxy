import { uniq } from 'lodash';
import Storage from './storage'
export default class Loader {
    middlewares: Array<string>;
    storage;
    constructor() {
        this.storage = new Storage();
        this.middlewares = this.storage.get();
    }

    load(app) {
        this.middlewares.forEach(m => app.use(require(m)(app)))
    }

    add(...m) {
        this.middlewares = uniq(this.middlewares.concat(m))
        this.save()
    }

    remove(i) {
        this.middlewares = this.middlewares.filter(m => m !== i)
        this.save()
    }

    get() {
        return this.middlewares;
    }

    save() {
        return this.storage.set(this.middlewares)
    }
}