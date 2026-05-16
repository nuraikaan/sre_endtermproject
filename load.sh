#!/bin/bash

while true; do
  curl -s http://localhost:3300/api/products > /dev/null
  sleep 0.2
done