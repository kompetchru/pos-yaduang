#!/bin/sh
# Wake-up loop: รอ Neon DB resume แล้วค่อยรัน prisma db push
# จำเป็นเพราะ Neon Free จะ suspend หลังไม่ใช้ → connection แรก timeout

MAX_TRIES=12
SLEEP_SEC=5

i=1
while [ $i -le $MAX_TRIES ]; do
  echo "▶ Attempt $i/$MAX_TRIES: connecting to DB..."
  if npx prisma db push --accept-data-loss --skip-generate; then
    echo "✅ DB ready, starting server..."
    exec node dist/index.js
  fi
  echo "⏳ DB not ready, retrying in ${SLEEP_SEC}s..."
  sleep $SLEEP_SEC
  i=$((i+1))
done

echo "❌ DB not reachable after $MAX_TRIES attempts. Starting server anyway."
exec node dist/index.js
