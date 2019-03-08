import * as Emittery from 'emittery';
import Storage from './storage';
import Application from './application';
import WorkspaceWindow from './window';

export default abstract class BaseManager
  extends Emittery.Typed<ZanProxyMac.IDataEventMap, keyof ZanProxyMac.IEmptyEventMap>
  implements ZanProxyMac.IManagerLifeCycle {
  public inited: boolean = false;

  public storage: Storage;
  public application: Application;
  public workspaceWindow: WorkspaceWindow;

  /**
   * first lifecycle, emit when application call init method.
   */
  public init?(): void | Promise<void>;
  /**
   * second lifecycle, emit when application finish all manager's init method.
   */
  public afterInit?(): void | Promise<void>;
  /**
   * last liftcycle, emit when application will quit.
   */
  public destory?(): void;
}
