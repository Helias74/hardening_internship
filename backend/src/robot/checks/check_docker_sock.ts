import { sshExec } from '../ssh.helper';

export async function check_docker_sock(containerIp: string): Promise<boolean> {
  try {
    // Vérifie si /var/run/docker.sock a des permissions trop larges (ex: 777)
    // S'il n'existe pas ou s'il n'est plus en 777 (ex: 660 standard ou supprimé), c'est validé
    const permissions = await sshExec(containerIp, 'stat -c "%a" /var/run/docker.sock 2>/dev/null || echo "not_found"');
    const permTrimmed = permissions.trim();
    
    if (permTrimmed === 'not_found') {
      return true; // Corrigé/supprimé
    }
    
    const permVal = parseInt(permTrimmed, 10);
    // On valide si la permission de lecture/écriture/exécution par les "autres" (le 3e chiffre octal) est à 0.
    // Par exemple, 777 est invalide, 660 ou 600 est valide.
    const othersPermissions = permVal % 10;
    return othersPermissions === 0;
  } catch (err) {
    console.warn(`[check_docker_sock] Impossible d'exécuter le check sur ${containerIp} :`, err.message);
    return false;
  }
}
