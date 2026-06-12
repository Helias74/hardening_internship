import { sshExec } from '../ssh.helper';

export async function check_shadow_perms(containerIp: string): Promise<boolean> {
  try {
    const perm = await sshExec(containerIp, 'stat -c "%a" /etc/shadow 2>/dev/null || echo "error"');
    const permTrimmed = perm.trim();
    if (permTrimmed === 'error') return false;
    
    const permVal = parseInt(permTrimmed, 10);
    // On valide si les permissions pour "others" (dernier chiffre octal) sont à 0.
    const others = permVal % 10;
    // On valide si les permissions pour le "group" (chiffre du milieu) sont au maximum en lecture seule (<= 4).
    const group = Math.floor((permVal % 100) / 10);
    
    return others === 0 && group <= 4;
  } catch (err) {
    console.warn(`[check_shadow_perms] Erreur sur ${containerIp} :`, err.message);
    return false;
  }
}
