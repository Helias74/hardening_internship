import { sshExec } from '../ssh.helper';

const SHADOW_COMMAND = "awk -F: '$1==\"student\" {print $2}' /etc/shadow";

export async function check_ssh_password(containerIp: string): Promise<boolean> {
  const defaultHash = process.env.DEFAULT_STUDENT_HASH;
  if (!defaultHash) {
    throw new Error('DEFAULT_STUDENT_HASH non défini dans .env');
  }

  let hash: string;
  try {
    const output = await sshExec(containerIp, SHADOW_COMMAND);
    hash = output.trim();
  } catch (err) {
    console.warn(`[check_ssh_password] Impossible de joindre ${containerIp} :`, err.message);
    return false;
  }

  return hash !== defaultHash;
}