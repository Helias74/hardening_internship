import { Client } from 'ssh2';
import * as fs from 'fs';

export function sshExec(host: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    const keyPath = process.env.SSH_ROBOT_KEY_PATH;
    if (!keyPath) {
      return reject(new Error('SSH_ROBOT_KEY_PATH non défini dans .env'));
    }

    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(keyPath);
    } catch {
      return reject(new Error(`Impossible de lire la clé privée : ${keyPath}`));
    }

    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          let stdout = '';

          stream
            .on('data', (data: Buffer) => { stdout += data.toString(); })
            .on('close', () => {
              conn.end();
              resolve(stdout);
            });
        });
      })
      .on('error', (err) => reject(err))
      .connect({
        host,
        port: 22,
        username: 'root',
        privateKey,
        readyTimeout: 5000,
      });
  });
}