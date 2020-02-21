export enum MessageType {
    identify = 'identify',
    signal = 'signal',
}

export interface Device {
    name: string,
    address: string,
}
export interface Message {
    type: string,
    payload: any
}