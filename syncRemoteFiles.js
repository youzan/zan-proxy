#!/usr/bin/env node

var gitlabUtil = require('./src/utils/gitlab.js');

var dc = require('./src/datacenter');

var RULE_REPOSITORY = 'fe/staticRedirectRules';

// var HOST_REPOSITORY = 'fe/youzan-host';

function connectToLocal(fileName, repository) {
    if (fileName) {
        var fixFileName = fileName.slice(0, fileName.indexOf('.'));
        var rawUrl = 'http://gitlab.qima-inc.com/' + repository + '/raw/master/' + fileName;
        gitlabUtil.getContent(rawUrl).then(function(resp) {
            resp.data.name = fixFileName + '-remote';
            resp.data.meta.url = rawUrl;
            resp.data.meta.remoteETag = resp.data.meta.ETag = resp.headers.etag;
            dc.saveRuleFile(fixFileName + '-remote', resp.data);
        }).catch(function() {
            console.log('获取' + fileName + '文件失败!');
        });
    }
}

function syncFiles(repository, path) {
    path = path || '';
    gitlabUtil.api(
        'http://gitlab.qima-inc.com/api/v3/projects/' + encodeURIComponent(repository) + '/repository/tree?ref_name=master&path=' + path
    ).then(function(resp) {
        if (resp.data) {
            resp.data.forEach(function(part) {
                if (part.type === 'blob' && part.name.toLowerCase() !== 'readme.md' ) {
                    // 拉取到本地并关联
                    connectToLocal(part.name, repository);
                }

                if (part.type === 'tree') {
                    // 递归获取
                    syncFiles(repository, part.name);
                }
            })
        }
    }).catch(function(e) {
        console.log(e);
    });
}

syncFiles(RULE_REPOSITORY);
// syncFiles(HOST_REPOSITORY);
