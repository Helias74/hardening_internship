import { sshExec } from '../ssh.helper';

export async function check_obsolete_package(containerIp: string): Promise<boolean> {
  try {
    // Vérifie si le paquet/binaire obsolète et vulnérable (/usr/local/bin/bash-legacy) existe encore
    const exists = await sshExec(containerIp, 'ls /usr/local/bin/bash-legacy 2>/dev/null || echo "not_found"');
    const existsTrimmed = exists.trim();

    // S'il n'existe plus, c'est validé (true)
    return existsTrimmed === 'not_found';
  } catch (err) {
    console.warn(`[check_obsolete_package] Impossible d'exécuter le check sur ${containerIp} :`, err.message);
    return false;
  }
}
