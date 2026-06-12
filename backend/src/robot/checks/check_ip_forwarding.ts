import { sshExec } from '../ssh.helper';

export async function check_ip_forwarding(containerIp: string): Promise<boolean> {
  try {
    // Vérifie si /etc/sysctl.conf contient net.ipv4.ip_forward = 0 activé
    const content = await sshExec(containerIp, 'cat /etc/sysctl.conf 2>/dev/null || echo ""');
    
    // Le regex cherche une ligne commençant par net.ipv4.ip_forward = 0 sans commentaire (# ou ;) devant
    const hasZero = /^\s*net\.ipv4\.ip_forward\s*=\s*0/m.test(content);
    const hasOne = /^\s*net\.ipv4\.ip_forward\s*=\s*1/m.test(content);
    
    return hasZero && !hasOne;
  } catch (err) {
    console.warn(`[check_ip_forwarding] Erreur sur ${containerIp} :`, err.message);
    return false;
  }
}
