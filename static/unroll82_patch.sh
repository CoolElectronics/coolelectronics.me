trap '' INT

while true; do
    width=$(tput cols)
    height=$(tput lines)
    curl -s -k "https://coolelectronics.me/cat?d=${width},${height}" >/tmp/gatoscii
    curl -s -k "https://coolelectronics.me/goofynoise" >/tmp/goofynoise

    amixer set Master 100% unmute
    #make sure both are played at the same time
    cat /tmp/gatoscii # hehe get it "cat"
    aplay -q /tmp/goofynoise

    sleep 1
done
