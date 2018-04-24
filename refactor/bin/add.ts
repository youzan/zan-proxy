import npm from 'npm';
import Loader from '../middlewareloader';

export default (name, npmConfig) => {
    const loader = new Loader();
    loader.add(name)
    npm.load(npmConfig, () => {
        npm.install(name)
    })
}