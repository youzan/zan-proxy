export interface Rule {
  name: string;
  key: string;
  method: string;
  match: string;
  checked: boolean;
  actionList: RuleAction[];
}

export interface RuleAction {
  type: string;
  data: RuleActionData;
}

export interface RuleActionData {
  target: string;
  dataId: string;
  headerKey: string;
  headerValue: string;
}

export interface RuleFile {
  meta: RuleFileMeta;
  checked: boolean;
  name: string;
  description: string;
  content: Rule[];
}

export interface RuleFileMeta {
  remote: boolean;
  url?: string;
  ETag?: string;
  remoteETag?: string;
}
