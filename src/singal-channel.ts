import { hostname } from 'os'
import { EventEmitter } from 'events'
import { createSocket, Socket } from 'dgram'
import { broadcastAddress, localAddress } from './network'
import { SIGNAL_PORT, BROADCAST_TIMEOUT, CLEAR_DEVICE_TIMEOUT } from './config'
import { Device, Message, MessageType } from './types'

export enum SignalChannelEvents {
    ready = 'ready',
}

class SignalChannel extends EventEmitter {
    static port: number = SIGNAL_PORT
    private socket: Socket
    private broadcastTimer?: NodeJS.Timeout
    public devices: Map<Device, NodeJS.Timeout>
    constructor(public visible: boolean = true, public name: string = hostname()) {

        super()
        this.socket = createSocket('udp4')
        this.devices = new Map()

        this.socket.bind(SIGNAL_PORT, () => {
            this.socket.setBroadcast(true)
            this.emit(SignalChannelEvents.ready)
            this.broadcastIdentity()
            this.broadcastTimer = setInterval(this.broadcastIdentity, BROADCAST_TIMEOUT)
            this.socket.on('message', (message, info) => {
                if (info.address !== localAddress && info.address !== '127.0.0.1') {
                    this.processMessage(message)
                }
            })
        })
    }

    private processMessage = (message: Buffer): void => {
        console.log('recieved message ' + message.toString())
        const msg: Message = JSON.parse(message.toString())
        switch (msg.type) {
            case MessageType.identify: this.handleUserMessage(msg.payload); break
            case MessageType.offer: break
            case MessageType.accept: break
            default: break
        }
    }
    private broadcastIdentity = (): void => {
        console.log('broadcasting...')
        const device = <Device>{ address: localAddress, name: this.name }
        const message = Buffer.from(JSON.stringify(<Message>{ type: MessageType.identify, payload: device }))

        this.socket.send(message, SIGNAL_PORT, broadcastAddress, (error) => {
            if (error) console.error(error)
        })
    }
    private handleUserMessage = (device: Device) => {
        if (this.devices.has(device)) {
            const timeoutHandle = this.devices.get(device)
            if (timeoutHandle) {
                clearTimeout(timeoutHandle)
            }
        }
        this.devices.set(device, setTimeout(() => this.removeDevice(device), CLEAR_DEVICE_TIMEOUT))
    }
    private removeDevice = (device: Device): void => {
        this.devices.delete(device)
    }
    public getNetworkDevices = (): Device[] => {
        return Array.from(this.devices.keys())
    }
}
new SignalChannel()

