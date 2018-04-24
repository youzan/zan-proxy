const axios = require('axios');

function getEtag(url, gitlabToken, callback) {
    axios({
        method: 'Head',
        url: url,
        headers: {
            'PRIVATE-TOKEN': gitlabToken || ''
        }
    }).then(function (res) {
        callback && callback(res.headers['etag']);
    }).catch(function (error) {

    });
};

/**
 * 获取单个文件的内容
 * @param url
 * @param gitlabToken
 */
function getContent(url, gitlabToken) {
    return axios({
        method: 'Get',
        url: url,
        headers: {
            'PRIVATE-TOKEN': gitlabToken || ''
        }
    });
};

/**
 * 读取gitlab仓库里的所有json文件
 * 返回
 */
function getAllJsonFileInRepository(gitlabUrl,repository,token) {

}
/**
 * 调用gitlab的接口
 * @param url
 * @param method
 * @param data
 * @param gitlabToken
 * @returns {AxiosPromise}
 */
function api(url, method, data, gitlabToken) {
    return axios({
        method: method || 'Get',
        url: url,
        headers: {
            'PRIVATE-TOKEN': gitlabToken || ''
        },
        data: data || {}
    })
}

module.exports = {
    getContent,
    getAllJsonFileInRepository,
    api,
    getEtag
};