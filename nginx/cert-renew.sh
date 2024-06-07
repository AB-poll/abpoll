
#!/bin/bash

echo "Triggered at $(date -u)" >> /var/log/certbot.log
/usr/bin/certbot renew --nginx --post-hook "nginx -s reload" >> /var/log/certbot.log