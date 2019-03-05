import WorkspaceStore from './workspace';
import HostFileStore from './host-file';
import RuleFileStore from './rule-file';
import PluginStore from './plugin';

const stores = {
  workspaceStore: new WorkspaceStore(),
  hostFileStore: new HostFileStore(),
  ruleFileStore: new RuleFileStore(),
  pluginStore: new PluginStore(),
};

// all stores class
export { WorkspaceStore, HostFileStore, RuleFileStore, PluginStore };

// all stores combine object
export type Stores = typeof stores;

// combine stores object
export default stores;
