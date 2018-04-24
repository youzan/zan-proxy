import Loader from '../middlewareloader';
import npm from 'npm'

export default name => {
    const loader = new Loader();
    loader.remove(name)
    npm.load({}, () => {
        npm.uninstall(name)
    })
}