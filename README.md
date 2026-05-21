#!/bin/bash

# git config user.name "github-actions"
# git config user.email "github-actions@github.com"
# git checkout --orphan latest_branch
# openssl genrsa -out ~/keypair 2048
# openssl rsa -in ~/keypair -pubout > keypair.pub
# git add .
# git commit -m "[skip ci]"
# git branch -D main
# git branch -m main
# git branch --set-upstream-to=origin/main main
# git push -f origin main
# 
# sudo apt-get update -qq
# sudo apt-get install -y --no-install-recommends aria2 ffmpeg chromium xvfb x11-apps imagemagick xorg xinit scrot x11vnc i3-wm xserver-xorg-input-mouse xserver-xorg-input-kbd gnome-screenshot xdotool wmctrl onboard git vim xterm xclip yt-dlp
# 
# pushd $PWD
# cd ~
# wget -c "https://github.com/cloudflare/cloudflared/releases/download/2026.3.0/cloudflared-linux-amd64"
# chmod +x cloudflared-linux-amd64
# mkdir -p Dropbox/projects
# cd Dropbox/projects
# git clone https://github.com/raoofha/dotfiles
# cd dotfiles
# ./setup.sh
# popd


export DISPLAY=:99
Xvfb :99 -screen 0 1920x947x24 -nolisten tcp &
sleep 5
i3 &
THEN=$(base64 cmd.p)
NOW=$(base64 cmd.p)
while true
do
  git pull origin main
  sleep 1
  NOW=$(base64 cmd.p)
  if [[ "$NOW" != "$THEN" ]] ;
  then
    openssl rsautl -decrypt -inkey ~/keypair -in cmd.p -out /dev/shm/pass
    openssl enc -d -aes-256-cbc -in cmd -out /dev/shm/cmd.sh -pass file:/dev/shm/pass
    rm /dev/shm/pass
    bash /dev/shm/cmd.sh
    cp cmd cmd.old
    THEN=$(base64 cmd.p)
  fi
done
