import * as net from 'net';

export async function check_unused_ports(containerIp: string): Promise<boolean> {
  const portsToCheck = [111]; // rpcbind

  for (const port of portsToCheck) {
    const status = await checkPortStatus(containerIp, port, 2000);
    if (status === 'OPEN' || status === 'OFFLINE') {
      // Si le port est ouvert OU si la machine est hors ligne, on ne valide pas (VULNERABLE)
      return false;
    }
  }

  // Tous les ports inutilisés sont fermés sur une machine en ligne (PATCHED)
  return true;
}

function checkPortStatus(host: string, port: number, timeout: number): Promise<'OPEN' | 'CLOSED' | 'OFFLINE'> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve('OPEN');
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve('OFFLINE');
    });

    socket.on('error', (err: any) => {
      socket.destroy();
      if (err.code === 'ECONNREFUSED') {
        resolve('CLOSED'); // Machine active, mais port fermé (Correction OK)
      } else {
        resolve('OFFLINE'); // Hôte injoignable, machine éteinte (Pas de points)
      }
    });

    socket.connect(port, host);
  });
}
