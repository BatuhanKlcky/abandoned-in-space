$token = (gh auth token).Trim()
$remoteUrl = "https://$token@github.com/BatuhanKlcky/abandoned-in-space.git"
git add .
git commit -m "Replace cartoon procedural textures with authentic NASA high-res photographic maps, fix modal display bug, and polish layout framing"
git push $remoteUrl main
git remote set-url origin "https://github.com/BatuhanKlcky/abandoned-in-space.git"
