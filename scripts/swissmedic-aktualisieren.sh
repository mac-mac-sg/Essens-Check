#!/usr/bin/env bash
set -euo pipefail

QUELLE="https://ogd.swissmedic.cloud/ogd-arzneimittel/Daten/OGD.zip"
ZIEL="${1:-daten/medikament-produkte.json}"
ARBEIT="$(mktemp -d)"
trap 'rm -rf "$ARBEIT"' EXIT

curl --fail --silent --show-error --location "$QUELLE" --output "$ARBEIT/OGD.zip"
unzip -q "$ARBEIT/OGD.zip" -d "$ARBEIT/ogd"
npx vite-node scripts/swissmedic-import.ts -- "$ARBEIT/ogd" "$ZIEL"
