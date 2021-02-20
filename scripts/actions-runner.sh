#!/bin/bash

if [[ "$@" == "bash" ]]; then
    exec $@
fi

export DOTNET_SYSTEM_NET_HTTP_USESOCKETSHTTPHANDLER=0

RUNNER_ORGANIZATION_URL="https://github.com/water-app-backend"
GH_RUNNER_PLATFORM="actions-runner-linux-x64"
GH_RUNNER_VERSION=$(curl --silent "https://api.github.com/repos/actions/runner/releases/latest" | grep tag_name | sed -E 's/.*"v([^"]+)".*/\1/')
RUNNER_NAME=$(whoami)

cd ~ && mkdir actions-runner && cd actions-runner
curl -LO https://github.com/actions/runner/releases/download/v${GH_RUNNER_VERSION}/${GH_RUNNER_PLATFORM}-${GH_RUNNER_VERSION}.tar.gz
tar -xzf ${GH_RUNNER_PLATFORM}-${GH_RUNNER_VERSION}.tar.gz && rm -f ${GH_RUNNER_PLATFORM}-${GH_RUNNER_VERSION}.tar.gz

./bin/installdependencies.sh

./config.sh \
  --url $RUNNER_ORGANIZATION_URL \
  --replace

./run.sh
