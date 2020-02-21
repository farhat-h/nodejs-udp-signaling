import { hostname } from 'os'
import { EventEmitter } from 'events'
import { createSocket, Socket } from 'dgram'
import { broadcastAddress, localAddress, LOOPBACK_ADDRESS } from './network'
import { SIGNAL_PORT, BROADCAST_TIMEOUT, CLEAR_DEVICE_TIMEOUT } from './config'
import { Device, Message, MessageType } from './types'

export enum ChannelEvents {
    ready = 'ready',
    newDevice = 'new-device',
    signal = 'signal',
}

export default class SignalChannel extends EventEmitter {
    static port: number = SIGNAL_PORT
    private socket: Socket
    private broadcastTimer?: NodeJS.Timeout
    public devices: Map<Device, NodeJS.Timeout>
    constructor(public name: string = hostname()) {

        super()
        this.socket = createSocket('udp4')
        this.devices = new Map()

        const [addr, cidrMask] = localAddress.split('/')
        this.socket.bind(SIGNAL_PORT, () => {
            this.socket.setBroadcast(true)
            this.emit(ChannelEvents.ready)
            this.broadcastIdentity()
            this.broadcastTimer = setInterval(this.broadcastIdentity, BROADCAST_TIMEOUT)
            this.socket.on('message', (message, info) => {
                if (info.address === addr || info.address === LOOPBACK_ADDRESS) return
                this.processMessage(message)
            })
        })
    }

    private processMessage = (message: Buffer): void => {
        const msg: Message = JSON.parse(message.toString())

        switch (msg.type) {
            case MessageType.identify: this.handleUserMessage(msg.payload); break
            case MessageType.signal: this.emit(ChannelEvents.signal, msg.payload); break
            default: break
        }
    }
    private broadcastIdentity = (): void => {
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
        } else { this.emit(ChannelEvents.newDevice, device) }
        this.devices.set(device, setTimeout(() => this.removeDevice(device), CLEAR_DEVICE_TIMEOUT))
    }
    private removeDevice = (device: Device): void => {
        this.devices.delete(device)
    }
    public getNetworkDevices = (): Device[] => {
        return Array.from(this.devices.keys())
    }
}
