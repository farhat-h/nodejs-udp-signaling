export interface Device {
    name: string,
    address: string,
}
export interface Message {
    type: string,
    payload: any
}

export enum MessageType {
    signal = 'signal'
}
export interface ServerParams {
    port: number,
    key: string
}
export interface HostInfo {
    hostname: string,
    arch: string,
    platform: string,
    isPi: boolean,
    memory: string
}