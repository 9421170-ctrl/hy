#!/bin/sh
if [ -n "$PORT" ]; then
  sed -i "s/:8080/:$PORT/g" /etc/hysteria/config.yaml
fi
exec hysteria server --config /etc/hysteria/config.yaml
