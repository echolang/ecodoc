#!/usr/bin/env bash
# The install step of action.yml: download a released ecodoc for this runner and put it on PATH.
# A release URL needs no token, and `latest/download` saves the API round trip for the default.
#
# env:
#   ECODOC_VERSION  tag (v0.1.3 / 0.1.3) or `latest` (default latest)
#   RUNNER_OS / RUNNER_ARCH / RUNNER_TEMP  set by GitHub Actions
#   GITHUB_PATH / GITHUB_OUTPUT  set by GitHub Actions

set -euo pipefail

REPO="echolang/ecodoc"
version="${ECODOC_VERSION:-latest}"

case "${RUNNER_OS:-}-${RUNNER_ARCH:-}" in
    macOS-ARM64)  asset="ecodoc-macos-arm64.tar.gz" ;;
    Linux-X64)    asset="ecodoc-linux-x86_64.tar.gz" ;;
    Linux-ARM64)  asset="ecodoc-linux-arm64.tar.gz" ;;
    *)
        echo "ecodoc: no prebuilt ecodoc for ${RUNNER_OS:-?} ${RUNNER_ARCH:-?}." >&2
        echo "run on macos-15, ubuntu-24.04 or ubuntu-24.04-arm, or build it and pass \`ecodoc:\`." >&2
        exit 1
        ;;
esac

case "${version}" in
    latest) url="https://github.com/${REPO}/releases/latest/download/${asset}" ;;
    v*)     url="https://github.com/${REPO}/releases/download/${version}/${asset}" ;;
    *)      url="https://github.com/${REPO}/releases/download/v${version}/${asset}" ;;
esac

bin="${RUNNER_TEMP:-/tmp}/ecodoc/bin"
mkdir -p "${bin}"

echo "downloading ${url}"
if ! curl -fsSL "${url}" | tar -xz -C "${bin}"; then
    echo "ecodoc: could not download ${url}" >&2
    echo "see https://github.com/${REPO}/releases for what is available." >&2
    exit 1
fi

echo "${bin}" >> "${GITHUB_PATH}"
echo "path=${bin}/ecodoc" >> "${GITHUB_OUTPUT}"

echo "installed ecodoc $("${bin}/ecodoc" --version) at ${bin}/ecodoc"
