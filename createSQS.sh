# create dummy queue
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name dummy-queue \
  --region eu-central-1 \
  --output table | cat

# list queue
aws --endpoint-url=http://localhost:4566 sqs list-queues \
  --region eu-central-1