import { sshExec } from '../ssh.helper';

export async function check_sudoers_apt(containerIp: string): Promise<boolean> {
  try {
    // Exécute sudo -l en tant que student pour voir ses privilèges.
    // Si student n'a pas le droit d'utiliser sudo (car le fichier a été supprimé ou modifié), cela retourne "not_allowed".
    const output = await sshExec(containerIp, 'sudo -l -U student 2>&1 || echo "not_allowed"');
    const outputTrimmed = output.trim();
    
    // Si la sortie contient NOPASSWD et /usr/bin/apt, la faille est présente.
    const isVulnerable = outputTrimmed.includes('NOPASSWD') && outputTrimmed.includes('/usr/bin/apt');
    return !isVulnerable;
  } catch (err) {
    console.warn(`[check_sudoers_apt] Erreur sur ${containerIp} :`, err.message);
    return false;
  }
}
