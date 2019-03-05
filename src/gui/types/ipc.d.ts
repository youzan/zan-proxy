declare namespace ZanProxyMac {
  /**
   * ipc 回复请求体
   */
  type IIpcReplay =
    | {
        success: true;
        data: any;
      }
    | {
        success: false;
        message: string;
      };
}
