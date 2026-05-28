import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import { DatabaseService } from '../database/database.service';

const NETWORK = 'hardening_internship_hardening_network';

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
        },
        NetworkMode: NETWORK,
      }
    });

    await container.start();

    const info = await container.inspect();
    const ip = info.NetworkSettings.Networks[NETWORK]?.IPAddress ?? '';

    return ip;
  }

  async createContainer(enrollmentId: number): Promise<string> {
    const container = await this.docker.createContainer({
      Image: 'hardening_internship-vulnerable',
      ExposedPorts: { '22/tcp': {} },
      HostConfig: {
        PortBindings: {
          '22/tcp': [{ HostPort: '0' }]
        },
        NetworkMode: NETWORK,
      }
    });

    await container.start();

    const info = await container.inspect();
    const ip = info.NetworkSettings.Networks[NETWORK]?.IPAddress ?? '';

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

  async stopContainerByIp(ip: string): Promise<void> {
    const containers = await this.docker.listContainers();

    const target = containers.find(c =>
      c.NetworkSettings?.Networks?.[NETWORK]?.IPAddress === ip
    );

    if (target) {
      const container = this.docker.getContainer(target.Id);
      await container.stop();
      await container.remove();
    }
  }
}