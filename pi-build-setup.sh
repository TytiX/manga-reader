#!/bin/bash
docker build . -t abelliard/manga-reader:pi

docker stop manga-reader
docker rm manga-reader

sudo cp /home/pi/manga-reader-pi/data/database.db /home/pi/manga-reader-pi/data/database.db.bak

docker create \
  --name=manga-reader \
  -p 3000:3000 \
  -v ~/manga-reader-pi/data:/app/data \
  -v ~/manga-reader-pi/logs:/app/logs \
  --restart unless-stopped \
  abelliard/manga-reader:pi

docker start manga-reader
