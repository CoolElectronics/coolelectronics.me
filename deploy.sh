rsync -a --progress --exclude 'node_modules' --exclude '.env' --exclude '.git' --exclude '/ftp' /home/ce/Documents/GitHub/svelte-test/ macbook:/home/ce/coolelectronics.me
ssh -t macbook "pm2 restart all"
