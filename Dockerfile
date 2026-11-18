FROM alpine:latest
RUN apk add --no-cache curl tzdata
RUN curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o /usr/bin/hysteria && chmod +x /usr/bin/hysteria
RUN mkdir -p /etc/hysteria
COPY config.yaml /etc/hysteria/config.yaml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
