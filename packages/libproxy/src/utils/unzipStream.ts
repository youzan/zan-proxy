import zlib from 'zlib'
import http from 'http'

export function unzipStream(
  stream: http.IncomingMessage,
  encoding?: string,
  options?: zlib.ZlibOptions
) {
  encoding =
    encoding ||
    (stream.headers && stream.headers['content-encoding']) ||
    'identity'

  switch (encoding) {
    case 'gzip':
    case 'deflate':
      break
    case 'identity':
      return stream
    default:
      throw new Error('unsupported encoding')
  }

  return stream.pipe(zlib.createUnzip(options))
}
