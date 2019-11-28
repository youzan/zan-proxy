import zlib from 'zlib';

// @ts-ignore
const isSupportBrotli = typeof zlib.createBrotliDecompress === 'function';

export default isSupportBrotli;
