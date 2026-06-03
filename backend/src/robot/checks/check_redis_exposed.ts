import * as net from 'net';

export async function check_redis_exposed(containerIp: string): Promise<boolean> {
  const port = 6379;
  const status = await checkRedisStatus(containerIp, port, 2000);

  // Si le serveur Redis répond à un PING sans authentification, la faille est active (VULNERABLE -> false)
  // Si le port est fermé (ECONNREFUSED) ou requiert une authentification (-NOAUTH), la faille est corrigée (PATCHED -> true)
  // Si la machine est éteinte ou injoignable (OFFLINE), on ne valide pas (false)
  return status === 'SECURE';
}

function checkRedisStatus(host: string, port: number, timeout: number): Promise<'VULNERABLE' | 'SECURE' | 'OFFLINE'> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      // Envoyer la commande PING du protocole RESP (Redis Serialization Protocol)
      socket.write('*1\r\n$4\r\nPING\r\n');
    });

    socket.on('data', (data) => {
      socket.destroy();
      resolved = true;
      const response = data.toString();
      if (response.includes('+PONG')) {
        resolve('VULNERABLE'); // Répond sans authentification
      } else {
        resolve('SECURE'); // Ex: erreur -NOAUTH
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      if (!resolved) {
        resolved = true;
        resolve('OFFLINE'); // Pas de réponse, ou injoignable
      }
    });

    socket.on('error', (err: any) => {
      socket.destroy();
      if (!resolved) {
        resolved = true;
        if (err.code === 'ECONNREFUSED') {
          resolve('SECURE'); // Port fermé ou inaccessible, mais machine active
        } else {
          resolve('OFFLINE'); // Machine éteinte ou autre erreur réseau (ex: EHOSTUNREACH)
        }
      }
    });

    socket.connect(port, host);
  });
}
