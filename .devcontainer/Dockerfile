# choice https://github.com/microsoft/vscode-dev-containers/tree/main/containers/typescript-node
ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt-get update && apt-get install -y \
    libksba8 \
    linux-libc-dev \
    libexpat1 \
    libexpat1-dev \
    libxml2 \
    libxml2-dev \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
