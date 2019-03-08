declare namespace ZanProxyMac {
  interface IManagerLifeCycle {
    /**
     * first lifecycle, emit when application call init method.
     */
    init?(): void | Promise<void>;
    /**
     * second lifecycle, emit when application finish all manager's init method.
     */
    afterInit?(): void | Promise<void>;
    /**
     * last liftcycle, emit when application will quit.
     */
    destory?(): void;
  }
}
