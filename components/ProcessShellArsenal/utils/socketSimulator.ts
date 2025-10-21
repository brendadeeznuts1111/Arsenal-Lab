// components/ProcessShellArsenal/utils/socketSimulator.ts
export function simulateSocketInfo() {
  // Simulate realistic socket connection info
  const localAddresses = ['127.0.0.1', '192.168.1.100', '10.0.0.1'];
  const remoteAddresses = ['104.18.32.1', '172.217.0.1', '151.101.1.1'];
  const families = ['IPv4', 'IPv6'];

  return {
    localAddress: localAddresses[Math.floor(Math.random() * localAddresses.length)],
    localPort: Math.floor(Math.random() * 60000) + 1024,
    localFamily: families[Math.floor(Math.random() * families.length)],
    remoteAddress: remoteAddresses[Math.floor(Math.random() * remoteAddresses.length)],
    remotePort: [80, 443, 8080, 3000][Math.floor(Math.random() * 4)],
    remoteFamily: families[Math.floor(Math.random() * families.length)]
  };
}

export function simulateProcessStats() {
  return {
    memoryUsage: Math.random() * 100,
    cpuUsage: Math.random() * 100,
    activeProcesses: Math.floor(Math.random() * 10) + 1
  };
}

export function simulateNetworkTraffic() {
  return {
    bytesSent: Math.floor(Math.random() * 1000000),
    bytesReceived: Math.floor(Math.random() * 1000000),
    connections: Math.floor(Math.random() * 50) + 1,
    latency: Math.floor(Math.random() * 100) + 10
  };
}
