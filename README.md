# rocketDDPDemo

# DEMO SETUP

## Atlas Configuration

The Atlas configuration components consist of:

1. M30 replica set plus a M50 analytics node
2. Data Lake pipeline to archive the aerospace database, launchData collection
3. Data Federation configuration combining three data sources:
  * Atlas cluster
  * Data Lake
  * S3 bucket with weather data
4. Charts Dashboard to review launch data
5. Triggers to generate notes for out of bound parameters (the code for this is fake, e.g., doesn't really work)
6. Atlas Search indexes to facilitate the note search and corresponding facets.
7. Atlas Search/Charts React App [app](runkel-rfv-demo-tyypa.mongodbstitch.com), [github](https://github.com/ranfysvalle02/reactivesearch-mdb)
8. Tableau connected to the Data Federation Endpoint using Tableau connector
9. DBeaver to execute SQL queries
  

## Atlas Cluster Data
There are two main collections used in the demo:

* launchData
* notes

This data can be found in the file ~/data/atlas/aerospace.archive.gz

```mongorestore --uri $CONNECTION_STR --username $DBUSER --password $DBUSER_PASS --gzip --archive=./data/atlas/aerospace.archive.gz```

## Data Federation Configuration

The configuration for the data federation can be found in the dataFederationConfiguration.json file.

The following schema files were created for Atlas SQL:

- Data Lake schema: dLakeLaunchDataSchema.json
- Schema for S3 bucket: s3SolarWindSchema.json

Use sqlSetSchema to update the schemas

## S3

The S3 bucket contains a single folder called SolarWinds. The contents of this folder are all the files found in the json files found in the ~/Data/solar-wind/json directory plus the SolarWindAll_2020_10_13.json file. The SolarWindAll_2020_10_13.json file contains all the same documents as the ~/Data/solar-wind/json directory, but the dates in the all.json file are set to match the launchData.


## Tableau
Load the LaunchDayPlasma.twb workspace into Tableau

To set up the Tableau connector use the combination of the Federated Endpoint URI plus the database name defined in the Data Federation Endpoint connection configuration. Don't use "myFederatedDatabase".

## Compass

The following aggregation queries should be loaded into Compass

1. Atlas Cluster -> aerospace database -> launchData collection
   * ReadingCountsByDevice
   * rollingWindowCalc
2. Atlas Cluster -> aerospace database -> notes collection
   * searchMetaFacets
   * Data Near Bounds
3. Data Lake -> launchData collection
   * ReadingCountByDevice

## Charts Dashboard


## Atlas Search/Charts Search Analytics React App

[Github repository](https://github.com/ranfysvalle02/reactivesearch-mdb)

1. Clone the repository
2. Deploy as App Services application using Realm-Cli
3. Configure:
   - DB Connection information
   - Charts dashboard

# DEMO SCRIPT

See this [google drive](https://docs.google.com/presentation/d/1dNBiLadWn2thuiVTlG62leawAoE-QEDBHUJlMr-7fSo/edit?usp=sharing) deck for a set of slides summarizing the demo and providing a screenshot of each demo step.

[Notion](https://www.notion.so/jayrunkel/Forester-Wave-05Aug2022-d94f4b4e240043cb86dc686792590c46) has some additional information as well. 
