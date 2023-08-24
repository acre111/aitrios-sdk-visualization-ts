# choice https://github.com/microsoft/vscode-dev-containers/tree/main/containers/typescript-node
ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt-get update && apt-get install -y \
    linux-libc-dev \
    libncurses-dev \
    ncurses-base \
    ncurses-bin \
    libsystemd0 \
    libudev1 \
    libpq-dev \
    libx11-6 \
    libx11-data \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
RUN npm uninstall -g pnpm
