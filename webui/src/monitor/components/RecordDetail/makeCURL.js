import shellEscape from 'shell-escape';
import { isObject, isArray } from 'lodash'

const makeCURL = ({
    method,
    headers,
    body,
    href,
    auth
}) => {
    const args = ['curl']
    
    // method
    args.push('-X')
    args.push(method || 'GET')

    // username
    if (auth) {
        args.push('-u');
        args.push(o.auth);
    }

    // headers
    headers = headers || {}
    Object.keys(headers).forEach(k => {
        const v = headers[k]
        args.push('-H')
        const h = v ? `${k}: ${v}`: `${k};`
        args.push(h)
    })

    if (body) {
        if (isObject(body) || isArray(body)) {
            body = JSON.stringify(body)
        }
        args.push('--data')
        args.push(body)
        
    }
    args.push(href)
    return shellEscape(args)
}

export default makeCURL