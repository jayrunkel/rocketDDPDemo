#!/bin/bash

# Steps required to deploy cluster

# brew install jq
# brew install mongodb-atlas-cli
# brew install aws-cli

# Automate via atlas cli/mongosh/bash/awscli
# 1. Deploy 3-node replica set with analytical node
# 2. Load data
#    - create indexes?
# 3. Build Search Indexes
# 4. Configure data lake
# 5. Configure federated endpoint
# 6. Load files into S3 bucket (awscli)

# Manual configuration steps
# 1. Compass Queries
#    - Atlas cluster
#      + launchData collection
#      + notes collection
#    - Data Lake snapshot
#    - S3 Bucket
# 2. dBeaver
#    - Atlas SQL federated query
# 3. Tableau
#    - workbook (requires Tableau license)

REGION=US_EAST_1
CLUSTER_NAME=RocketDemo
DBUSER=demoUser
DBUSER_PASS=MoonLaunchBaby
INSTANCE_TIER=M10

atlas clusters create $CLUSTER_NAME --diskSizeGB 10 --mdbVersion 6.0 --provider AWS --tier $INSTANCE_TIER --region $REGION
atlas dbusers create --username $DBUSER --password MoonLaunchBaby --role readWriteAnyDatabase
atlas clusters watch $CLUSTER_NAME

CONNECTION_STR=$(atlas clusters connectionStrings describe $CLUSTER_NAME | jq '.standardSrv')

mongorestore --uri $CONNECTION_STR --username $DBUSER --password $DBUSER_PASS --gzip --archive=./Data/aerospace.archive.gz


# Load data in S3 bucket
aws s3 cp . s3://carefirst-poc/ --recursive

# Set up AIM role
# Configure bucket security

# Configure data lake pipeline

# configure federated endpoint

