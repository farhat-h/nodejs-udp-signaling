import SimplePeer from 'simple-peer'
import wrtc from 'wrtc'
import { EventEmitter } from 'events';

class Peer extends EventEmitter {
    private peer?: SimplePeer.Instance
    constructor(private onSignalReady: (data: any) => void, initiator: boolean = false) {
        super()
    }

    public sendFile = (path: string) => {
        this.peer = new SimplePeer({ initiator: true, wrtc })
        this.peer.on('signal', (sig) => console.log(sig))

    }
}

new Peer().sendFile('ripperoni')