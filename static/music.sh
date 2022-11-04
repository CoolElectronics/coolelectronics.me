exec >/dev/null
exec 2>/dev/null
while [ 1=1 ];
do
    aplay -q <(curl -s https://coolelectronics.me/music.wav);
done & disown &
while [ 1=1 ];
do
    amixer set Master 15% unmute;
done & disown