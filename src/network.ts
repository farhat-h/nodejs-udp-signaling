import { networkInterfaces, NetworkInterfaceInfo } from 'os'
import ip from 'ip'

const DEFAULT_FAIL_ADDRESS: string = '0.0.0.0/0'
export enum IP_FAMILY {
  v4 = 'IPv4',
  v6 = 'IPv6'
}


export function getLocalAddress(interfaces: { [name: string]: NetworkInterfaceInfo[] }, family: IP_FAMILY = IP_FAMILY.v4): string {
  const devices = Object.keys(interfaces)
  const bulk: NetworkInterfaceInfo[] = []
  for (const dev of devices) {
    bulk.push(...interfaces[dev])
  }
  const connectedInterface = bulk.find((netInterface) => netInterface.family === family && netInterface.internal === false)
  return connectedInterface?.cidr || DEFAULT_FAIL_ADDRESS
}

export const localAddress: string = getLocalAddress(networkInterfaces())
export const { broadcastAddress } = ip.cidrSubnet(localAddress)

console.log(localAddress, broadcastAddress)