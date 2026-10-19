$token = (gh auth token).Trim()
$remoteUrl = "https://$token@github.com/BatuhanKlcky/abandoned-in-space.git"
git add .
git commit -m "Fix guided tour banner styling and resolve controls hint overlap with timeline filter bar"
git push $remoteUrl main
git remote set-url origin "https://github.com/BatuhanKlcky/abandoned-in-space.git"
