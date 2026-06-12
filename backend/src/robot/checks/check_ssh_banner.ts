import { sshExec } from '../ssh.helper';

export async function check_ssh_banner(containerIp: string): Promise<boolean> {
  try {
    const output = await sshExec(containerIp, 'sshd -T 2>/dev/null || echo ""');
    const outputTrimmed = output.trim();
    
    // Si la sortie contient debianbanner no, c'est sécurisé.
    return outputTrimmed.includes('debianbanner no');
  } catch (err) {
    console.warn(`[check_ssh_banner] Erreur sur ${containerIp} :`, err.message);
    return false;
  }
}
