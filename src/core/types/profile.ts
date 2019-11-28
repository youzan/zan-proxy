export interface IProfile {
  /** 是否启用host解析 */
  enableHost: boolean;
  /** 是否启用转发规则 */
  enableRule: boolean;
  /** 自定义二次代理服务器 */
  customProxy?: string;
  /** 工程路径配置 */
  projectPath: {
    [key: string]: string;
  };
}
