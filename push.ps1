$token = (gh auth token).Trim()
$remoteUrl = "https://$token@github.com/BatuhanKlcky/abandoned-in-space.git"
git add .
git commit -m "Enhance radio transmission speech player, add official NASA sources modal, and refine mobile responsive layout"
git push $remoteUrl main
git remote set-url origin "https://github.com/BatuhanKlcky/abandoned-in-space.git"
