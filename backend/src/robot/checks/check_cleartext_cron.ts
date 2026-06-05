import { sshExec } from '../ssh.helper';

export async function check_cleartext_cron(containerIp: string): Promise<boolean> {
  try {
    // Vérifie si le fichier de backup existe et contient des credentials en clair
    const content = await sshExec(containerIp, 'cat /etc/cron.d/backup 2>/dev/null || echo "not_found"');
    const contentTrimmed = content.trim();

    if (contentTrimmed === 'not_found') {
      return true; // Fichier supprimé, validé
    }

    // Si le fichier contient encore le mot de passe secret "supersecret", la faille est active (non validé)
    const hasSecret = contentTrimmed.includes('supersecret');
    return !hasSecret;
  } catch (err) {
    console.warn(`[check_cleartext_cron] Impossible d'exécuter le check sur ${containerIp} :`, err.message);
    return false;
  }
}
