ARG REGISTRY=public.ecr.aws
ARG REPOSITORY=docker/library
ARG BASE_IMAGE=node
ARG BASE_VERSION=24
ARG VARIANT=

FROM $REGISTRY/$REPOSITORY/$BASE_IMAGE:$BASE_VERSION$VARIANT

USER root:root

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gnupg \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
  && chmod a+r /etc/apt/keyrings/docker.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list \
  && apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    docker-ce-cli \
  && curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 -o /tmp/get_helm.sh \
  && chmod 700 /tmp/get_helm.sh \
  && /tmp/get_helm.sh \
  && rm -f /tmp/get_helm.sh \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json /opt/semantic-release/
RUN npm --prefix /opt/semantic-release/ ci
COPY . /opt/semantic-release/
ENV PATH=/opt/semantic-release/bin:$PATH

CMD ["semantic-release"]
