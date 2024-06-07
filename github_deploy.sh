 #!/bin/bash
sudo git pull https://github.com/AB-poll/abpoll-flask
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log"
echo "ran script!"
exit 1