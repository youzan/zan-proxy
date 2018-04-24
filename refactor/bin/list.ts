import Loader from '../middlewareloader';

export default () => {
    const loader = new Loader();
    return loader.get();
}