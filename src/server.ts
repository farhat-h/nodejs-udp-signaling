import { ServerParams, Message, MessageType } from './types'
import { Socket, createSocket } from 'dgram'
import { DeviceInfo } from './device'
import { broadcastAddress } from './network'
import { SIGNAL_PORT, BROADCAST_TIMEOUT} from './config'
import shortid from 'shortid'
export class Server {

    private socket: Socket
    private broadcastInterval

    constructor(private params: ServerParams = { port: SIGNAL_PORT, key: shortid.generate() }) {
        this.socket = createSocket('udp4')
        this.socket.bind(params.port, () => {
            console.log(`Socket is bound to port: ${params.port}`)
            this.socket.setBroadcast(true)
            this.broadcastInterval = setInterval(this.broadcastIdentity, BROADCAST_TIMEOUT)
        })
    }

    broadcastIdentity = () => {

        const message: Message = {
            type: MessageType.signal,
            payload: DeviceInfo
        }
        const encodedMessage: string = JSON.stringify(message)
        this.socket.send(Buffer.from(encodedMessage), this.params.port, broadcastAddress, (err) => console.error(err&&err))
    }

}

const server = new Server()