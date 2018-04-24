import { Stream } from 'stream'
import { Buffer } from 'buffer'
import { isString, isArray } from 'lodash'

export function streamToString(stream: Stream, encoding = 'utf8'): Promise<string> {
  let output: string | Array<any> = ''

  return new Promise(function(resolve, reject) {
    stream.on('data', data => {
      if (Buffer.isBuffer(data)) {
        output += data.toString(encoding)
      } else if (isString(data)) {
        output += data
      } else {
        if (!isArray(output)) {
          output = []
        }
        output.push(data)
      }
    })
    stream.on('end', () => {
      if (isString(output)) {
        resolve(output)
      } else {
        resolve(JSON.stringify(output))
      }
    })
    stream.on('error', err => {
      reject(err)
    })
  })
}
