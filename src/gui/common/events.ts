const WORKSPACE_EVENTS_PREFIX = 'workspace';
/**
 * 工作区相关事件
 */
export const WORKSPACE_EVENTS = {
  fetch: `${WORKSPACE_EVENTS_PREFIX}.fetch`,
  list: `${WORKSPACE_EVENTS_PREFIX}.list`,
  create: `${WORKSPACE_EVENTS_PREFIX}.create`,
  activate: `${WORKSPACE_EVENTS_PREFIX}.activate`,
  deactivate: `${WORKSPACE_EVENTS_PREFIX}.deactivate`,
  save: `${WORKSPACE_EVENTS_PREFIX}.save`,
  export: `${WORKSPACE_EVENTS_PREFIX}.export`,
  remove: `${WORKSPACE_EVENTS_PREFIX}.remove`,
  import: `${WORKSPACE_EVENTS_PREFIX}.import`,
  sort: `${WORKSPACE_EVENTS_PREFIX}.sort`,
};

const HOST_FILE_EVENTS_PREFIX = 'hostFile';
/**
 * host 文件相关事件
 */
export const HOST_FILE_EVENTS = {
  fetch: `${HOST_FILE_EVENTS_PREFIX}.fetch`,
  list: `${HOST_FILE_EVENTS_PREFIX}.list`,
};

const RULE_FILE_EVENTS_PREFIX = 'ruleFile';
/**
 * 规则文件相关事件
 */
export const RULE_FILE_EVENTS = {
  fetch: `${RULE_FILE_EVENTS_PREFIX}.fetch`,
  list: `${RULE_FILE_EVENTS_PREFIX}.list`,
};

const ZAN_PROXY_PREFIX = 'zanProxy';
/**
 * zan-proxy 相关事件
 */
export const ZAN_PROXY_EVENTS = {
  showManager: `${ZAN_PROXY_PREFIX}.showManager`,
};

const PLUGIN_LOADER_PREFIX = 'plugin-loader';
/**
 * 插件加载相关事件
 */
export const PLUGIN_LOADER_EVENTS = {
  getNames: `${PLUGIN_LOADER_PREFIX}.getNames`,
};
