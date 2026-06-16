#!/bin/bash

set -e

# Add config/creds copying here..
if ! aws s3 cp s3://$S3_CONFIG_BUCKET/$S3_CONFIG_PATH/env.config /app/.env; then
	echo "Failed to copy env.config from S3."
	exit 1
fi

if ! aws s3 cp s3://$S3_CONFIG_BUCKET/$S3_CONFIG_PATH/seed_data/internal.clients.seed.json /app/seed.data/internal.clients.seed.json; then
	echo "Failed to copy internal.clients.seed.json from S3."
	exit 1
fi

if ! aws s3 cp s3://$S3_CONFIG_BUCKET/$S3_CONFIG_PATH/seed_data/default.users.seed.json /app/seed.data/default.users.seed.json; then
	echo "Failed to copy default.users.seed.json from S3."
	exit 1
fi

cd /app
# Add any other scripts here...
# Start the service
# npm run start
pm2-runtime src/index.js
