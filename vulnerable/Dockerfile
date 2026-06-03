FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    openssh-server \
    rpcbind \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /var/run/sshd

RUN useradd -m -s /bin/bash student && \
    echo "student:student" | chpasswd && \
    echo "root:toor" | chpasswd

RUN mkdir -p /root/.ssh && \
    chmod 700 /root/.ssh

COPY authorized_keys /root/.ssh/authorized_keys
RUN chmod 600 /root/.ssh/authorized_keys

COPY redis-server.init /etc/init.d/redis-server
RUN chmod +x /etc/init.d/redis-server

RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    echo "PermitEmptyPasswords yes" >> /etc/ssh/sshd_config

# Configurer Redis vulnérable (écoute sur toutes les interfaces, pas d'authentification)
RUN sed -i 's/bind 127.0.0.1 -::1/bind 0.0.0.0/' /etc/redis/redis.conf && \
    sed -i 's/protected-mode yes/protected-mode no/' /etc/redis/redis.conf

# Bit SUID abusif sur /usr/bin/find
RUN chmod u+s /usr/bin/find

EXPOSE 22 111 6379
CMD ["/bin/sh", "-c", "rpcbind && service redis-server start && mkdir -p /var/run/sshd && /usr/sbin/sshd && tail -f /dev/null"]
