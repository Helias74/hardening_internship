import { sshExec } from '../ssh.helper';

export async function check_suid_find(containerIp: string): Promise<boolean> {
  try {
    // Vérifier si le binaire /usr/bin/find possède le bit SUID (permission 4000)
    const output = await sshExec(containerIp, 'find /usr/bin/find -perm -4000');
    const hasSuid = output.trim().includes('/usr/bin/find');

    // Si le bit SUID est présent, la faille est active (retourne false pour vulnérable)
    // S'il n'est plus présent, la faille est corrigée (retourne true pour sécurisée)
    return !hasSuid;
  } catch (err) {
    console.warn(`[check_suid_find] Impossible d'exécuter le check sur ${containerIp} :`, err.message);
    return false;
  }
}
