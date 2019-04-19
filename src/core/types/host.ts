export type IHostFileMeta =
  | {
      local: false;
      url: string;
    }
  | {
      local: true;
    };

export interface IHostFile {
  meta: IHostFileMeta;
  checked: boolean;
  name: string;
  description: string;
  content: {
    [key: string]: string;
  };
}
