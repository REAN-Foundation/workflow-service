///////////////////////////////////////////////////////////////////////////////////

export interface CapturedMessage {
    CapturedAt        : Date;
    TenantCode        : string;
    ToPhone           : string;
    SchemaId         ?: string;
    SchemaInstanceId ?: string;
    EventType        ?: string;
    MessageType      ?: string;
    MessageChannel   ?: string;
    TextMessage      ?: string;
    QuestionText     ?: string;
    QuestionOptions  ?: any;
    Location         ?: any;
    RawEvent          : any;
}

class MessageCaptureStoreImpl {

    private _buffer: CapturedMessage[] = [];

    private _capacity = 500;

    add = (message: CapturedMessage): void => {
        this._buffer.push(message);
        if (this._buffer.length > this._capacity) {
            this._buffer.splice(0, this._buffer.length - this._capacity);
        }
    };

    getAll = (): CapturedMessage[] => {
        return [...this._buffer];
    };

    getBySchemaInstance = (schemaInstanceId: string): CapturedMessage[] => {
        return this._buffer.filter(x => x.SchemaInstanceId === schemaInstanceId);
    };

    clear = (): void => {
        this._buffer = [];
    };

}

export const MessageCaptureStore = new MessageCaptureStoreImpl();
