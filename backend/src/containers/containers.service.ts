import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ContainersService {
  private docker: Docker;

  constructor(private db: DatabaseService) {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async createContainerTest(): Promise<string> {
    const container = await this.docker.createContainer({
      Image: 'hardening_internship-vulnerable',
      ExposedPorts: { '22/tcp': {} },
      HostConfig: {
        PortBindings: {
          '22/tcp': [{ HostPort: '0' }]
        }
      }
    });

    await container.start();

    const info = await container.inspect();
    const ip = info.NetworkSettings.Networks['bridge']?.IPAddress ?? '';

    return ip;
  }

  async createContainer(enrollmentId: number): Promise<string> {
    const container = await this.docker.createContainer({
      Image: 'hardening_internship-vulnerable',
      ExposedPorts: { '22/tcp': {} },
      HostConfig: {
        PortBindings: {
          '22/tcp': [{ HostPort: '0' }]
        }
      }
    });

    await container.start();

    const info = await container.inspect();
    const port = info.NetworkSettings.Ports['22/tcp'][0].HostPort;
    const ip = info.NetworkSettings.Networks['bridge']?.IPAddress ?? '';

    await this.db.query(
      `UPDATE enrollments SET container_ip = $1 WHERE id = $2`,
      [ip, enrollmentId]
    );

    return ip;
  }

  async stopContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.stop();
    await container.remove();
  }
}