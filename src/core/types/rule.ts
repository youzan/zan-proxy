export interface IRule {
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
  content: IRule[];
}

export interface IRuleFileMeta {
  remote: boolean;
  url?: string;
}

export interface IRuleTest {
  match: string;
  url: string;
  targetTpl: string;
}
