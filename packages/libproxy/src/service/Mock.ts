import { HasAsyncInit } from './hasAsyncInit';
import { Token } from 'typedi';

export interface MockData {
    id: string,
    name: string,
    type: string,
    content: string, //  buffer instead?
}

export interface MockService extends HasAsyncInit {
    getMockDataByID(id: string): Promise<MockData | undefined>
    getMockDataList(): Promise<Array<MockData>>
    saveMockDataList(dataList: Array<MockData>): Promise<Array<MockData>>
    add(name: string, type: string, content: string): Promise<MockData>
    saveDataFileContent(id, content): Promise<MockData>
}

export const MockServiceToken = new Token<MockService>('service.Mock')