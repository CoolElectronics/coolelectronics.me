rsync -a --progress --exclude 'node_modules' --exclude '.env' --exclude '.git' --exclude '/ftp' /home/ce/Documents/GitHub/svelte-test/ prod:/home/ubuntu/
ssh -t prod "pm2 restart all"
