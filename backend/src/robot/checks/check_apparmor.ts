import { sshExec } from '../ssh.helper';

export async function check_apparmor(containerIp: string): Promise<boolean> {
  try {
    // Vérifie le mode du profil AppArmor simulé
    const content = await sshExec(containerIp, 'cat /etc/apparmor.d/custom-profile 2>/dev/null || echo "not_found"');
    const contentTrimmed = content.trim();

    if (contentTrimmed === 'not_found') {
      return true; // Si supprimé ou géré autrement, considéré comme sécurisé
    }

    // Le profil doit contenir flags=(enforce) ou ne plus avoir flags=(complain)
    const isEnforce = contentTrimmed.includes('flags=(enforce)');
    const isComplain = contentTrimmed.includes('flags=(complain)');

    return isEnforce || !isComplain;
  } catch (err) {
    console.warn(`[check_apparmor] Impossible d'exécuter le check sur ${containerIp} :`, err.message);
    return false;
  }
}
