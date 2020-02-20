export enum MessageType {
    identify = 'identify',
    offer = 'identify',
    accept = 'identify'
}

export interface Device {
    name: string,
    address: string,
}
export interface Message {
    type: string,
    payload: any
}