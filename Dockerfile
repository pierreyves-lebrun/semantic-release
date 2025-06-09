ARG REGISTRY=public.ecr.aws
ARG REPOSITORY=docker/library
ARG BASE_IMAGE=node
ARG BASE_VERSION=21
ARG VARIANT=

FROM $REGISTRY/$REPOSITORY/$BASE_IMAGE:$BASE_VERSION$VARIANT AS base

USER root:root

RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  git \
  && \
  rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 && \
  chmod 700 get_helm.sh && \
  ./get_helm.sh

RUN apt-get update && apt-get install -y ca-certificates curl gnupg
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN chmod a+r /etc/apt/keyrings/docker.gpg

RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get update && apt-get install -y docker-ce-cli && \
  rm -rf /var/lib/apt/lists/*

COPY package*.json /opt/semantic-release/
RUN npm --prefix /opt/semantic-release/ ci
COPY . /opt/semantic-release/
ENV PATH=/opt/semantic-release/bin:$PATH

CMD ["semantic-release"]
