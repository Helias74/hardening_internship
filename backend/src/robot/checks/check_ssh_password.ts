import { Client } from 'ssh2';
import { sshExec } from '../ssh.helper';

const SSHD_COMMAND = "sshd -T";

export async function check_ssh_password(containerIp: string): Promise<boolean> {
  let defaultPasswordActive = false;
  let sshConfigSecure = false;

  try {
    // 1. Tester s'il est possible de se connecter avec student:student ou student:vide via SSH
    defaultPasswordActive = await testSshPassword(containerIp, 'student', 'student') ||
                            await testSshPassword(containerIp, 'student', '');

    // 2. Vérification de la configuration SSHD (sshd -T)
    const sshdOutput = await sshExec(containerIp, SSHD_COMMAND);
    const sshdConfig = parseSshdT(sshdOutput);

    const permitRootLogin = sshdConfig['permitrootlogin'] || 'yes';
    const passwordAuth = sshdConfig['passwordauthentication'] || 'yes';
    const permitEmptyPass = sshdConfig['permitemptypasswords'] || 'yes';

    // Pour être sécurisé :
    // - Pas de root login par mot de passe (prohibit-password ou no)
    // - Authentification par mot de passe globale désactivée
    // - Pas de mots de passe vides autorisés
    sshConfigSecure =
      permitRootLogin !== 'yes' &&
      passwordAuth !== 'yes' &&
      permitEmptyPass === 'no';

  } catch (err) {
    console.warn(`[check_ssh_password] Impossible de joindre ou d'exécuter les checks sur ${containerIp} :`, err.message);
    return false;
  }

  // La faille est corrigée si le mot de passe par défaut n'est plus actif ET que la config SSHD est sécurisée
  return !defaultPasswordActive && sshConfigSecure;
}

function testSshPassword(host: string, username: string, password?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const conn = new Client();
    conn
      .on('ready', () => {
        conn.end();
        resolve(true); // Connexion réussie = Faille active (VULNERABLE)
      })
      .on('error', () => {
        conn.end();
        resolve(false); // Connexion rejetée = Faille corrigée (PATCHED)
      })
      .connect({
        host,
        port: 22,
        username,
        password,
        readyTimeout: 3000,
      });
  });
}

function parseSshdT(output: string): Record<string, string> {
  const config: Record<string, string> = {};
  const lines = output.split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      config[parts[0].toLowerCase()] = parts.slice(1).join(' ');
    }
  }
  return config;
}