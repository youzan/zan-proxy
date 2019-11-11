import { IRecord } from '@core/types/http-traffic';
import { Omit } from 'lodash';

export type IClientRecord = Required<Omit<IRecord, 'response'>> & Pick<IRecord, 'response'>;

export interface IRecordMap {
  [id: string]: IClientRecord;
}

export interface IRootState {
  recordMap: IRecordMap; // 当前所有记录
  filteredIds: number[]; // 过滤后的数组 存放记录id
  selectId: string; // 当前选择的记录
}
