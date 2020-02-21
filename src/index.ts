import Peer from 'simple-peer'
import wrtc from 'wrtc'
import SignalingChannel, { SignalChannelEvents } from './signaling-channel'
import { Device } from './types'

class Terminal {
    private peer?: Peer.Instance
    private channel: SignalingChannel
    constructor() {
        this.channel = new SignalingChannel()
    }

}
