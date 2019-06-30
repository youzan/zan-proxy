export interface ORule {
  name: string;
  key: string;
  method: string;
  match: string;
  checked: boolean;
  actionList: IRuleAction[];
}

export interface IRuleAction {
  type: string;
  data: IRuleActionData;
}

export interface IRuleActionData {
  target: string;
  dataId: string;
  headerKey: string;
  headerValue: string;
}

export interface IRuleFile {
  meta: IRuleFileMeta;
  checked: boolean;
  name: string;
  description: string;
  content: ORule[];
}

export interface IRuleFileMeta {
  remote: boolean;
  url?: string;
  ETag?: string;
  remoteETag?: string;
}
