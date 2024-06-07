FROM nginx:1.19.7-alpine
# install certbot and crond
RUN apk add --no-cache certbot-nginx openrc busybox-initscripts
# configure crontab to run certbot cert renew each week
ADD ./cert-renew.sh .
RUN chmod a+x /cert-renew.sh
RUN sed -i "\$i echo \"0 0 * * * sh /cert-renew.sh\" | crontab - && crond -L /var/log/cron" docker-entrypoint.sh
# add the custom nginx conf
RUN rm -rf /etc/nginx/conf.d/*
ADD ./conf.d /etc/nginx/conf.d