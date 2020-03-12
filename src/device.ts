import { totalmem, hostname, arch, platform } from 'os'
import { HostInfo } from './types'


export const DeviceInfo: HostInfo = {
    arch: arch(),
    hostname: hostname(),
    isPi: true,
    platform: platform(),
    memory: `${totalmem()}bytes`
}