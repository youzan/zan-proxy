import { Service, Inject } from 'typedi';
import { MockService as IMockService, MockServiceToken, MockStorageToken, Storage, MockData } from '../../service'
import { EventEmitter } from 'events';
import uuid from 'uuid/v4'

const storageKey = '$$MOCK_DATA$$'

@Service({
    id: MockServiceToken
})
export class MockService extends EventEmitter implements IMockService {
    @Inject(MockStorageToken) storage: Storage
    data: Array<MockData>

    async init() {
        this.data = await this.storage.get(storageKey) || []
    }

    async getMockDataByID(id) {
        return this.data.filter(mockData => mockData.id === id)[0]
    }
    async getMockDataList() {
        return this.data
    }
    async saveMockDataList(data) {
        this.data = data
        await this.saveData()
        return this.data
    }
    async add(name, type, content) {
        const mockData: MockData = {
            id: uuid(),
            name,
            type,
            content
        }
        this.data.push(mockData)
        await this.saveData()
        return mockData
    }

    async saveDataFileContent(id, content) {
        const mockData = await this.getMockDataByID(id)
        mockData.content = content
        await this.saveData()
        return mockData
    }

    async saveData() {
        await this.storage.set(storageKey, this.data)
        this.emit('data-change', this.data)
    }
    
}