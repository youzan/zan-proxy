import raw from 'raw-body'
import URL from 'url'
import Stream from 'stream'
import { unzipStream, streamToString } from '../utils'

export const endPoint = httpTrafficService => {
  return next => async ctx => {
    const { userID } = ctx
    const urlObj = URL.parse(ctx.req.url)
    const requestID = httpTrafficService.getRequestId(userID, urlObj)
    if (requestID > 0) {
      ctx.requestID = requestID
      await httpTrafficService.requestBegin({
        id: requestID,
        userId: userID,
        clientIp: ctx.clientIP,
        method: ctx.req.method,
        httpVersion: ctx.req.httpVersion,
        urlObj,
        headers: ctx.req.headers
      })
    }
    const receiveRequestTime = Date.now()
    await next(ctx)
    if (requestID > 0) {
      const { res, remoteRequestBeginTime, remoteResponseStartTime } = ctx
      const requestEndTime = Date.now()
      const { statusCode } = res
      const headers = res.getHeaders()
      getResponseBody(res).then(body => {
        httpTrafficService.serverReturn({
          userId: userID,
          id: requestID,
          toClientResponse: {
            statusCode: statusCode,
            headers: headers,
            receiveRequestTime,
            requestEndTime,
            remoteIp: urlObj.host,
            remoteRequestBeginTime: remoteRequestBeginTime,
            remoteResponseStartTime: remoteResponseStartTime,
            body
          }
        })
      })
    }
  }
}

export const actualRequest = httpTrafficService => {
  return next => async ctx => {
    const { userID, requestID } = ctx
    if (requestID > 0) {
      const url = URL.parse(ctx.req.url)
      const { headers, method, httpVersion } = ctx.req
      getRequestBody(ctx.req).then(body => {
        httpTrafficService.actualRequest({
          id: requestID,
          userId: userID,
          requestData: {
            body,
            headers,
            path: url.path,
            protocol: url.protocol,
            port: url.port || 80,
            method: method,
            httpVersion: httpVersion
          }
        })
      })
    }
    ctx.remoteRequestBeginTime = Date.now()
    await next(ctx)
    ctx.remoteResponseStartTime = Date.now()
  }
}

const getRequestBody = async req => {
  if (req.body) {
    return Promise.resolve(req.body)
  }
  return new Promise((resolve, reject) => {
    raw(unzipStream(req), 'utf-8', function(err, body) {
      if (err) {
        return reject(err)
      } else {
        return resolve(body)
      }
    })
  })
}

const getResponseBody = async res => {
  const { body } = res
  if (!body) {
    return Promise.resolve('')
  }
  if (Buffer.isBuffer(body)) {
    return Promise.resolve(body.toString('utf-8'))
  }
  if ('string' == typeof body) {
    return Promise.resolve(body)
  }
  if (body instanceof Stream) {
    return streamToString(body)
  }
}
