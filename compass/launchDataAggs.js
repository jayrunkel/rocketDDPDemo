// ================================================================
// launchData Collection - Atlas Cluster
// ================================================================

// ReadingsCountByDevice

[{
 $group: {
  _id: '$meta.device',
  readingsCount: {
   $count: {}
  }
 }
}]

// rollingWindowCalc

[{
 $match: {
  'meta.device': 'truth'
 }
}, {
 $setWindowFields: {
  partitionBy: null,
  sortBy: {
   time: 1
  },
  output: {
   velocityRollAvg: {
    $avg: '$truth_vel_CON_ECEF_ECEF_MpS2',
    window: {
     documents: [
      -5,
      5
     ]
    }
   },
   velocityWindowMax: {
    $max: '$truth_vel_CON_ECEF_ECEF_MpS2',
    window: {
     documents: [
      -5,
      5
     ]
    }
   },
   velocityWindowMin: {
    $min: '$truth_vel_CON_ECEF_ECEF_MpS2',
    window: {
     documents: [
      -5,
      5
     ]
    }
   }
  }
 }
}]

// ================================================================
// Notes Collection - Atlas Cluster
// ================================================================

// searchMetaFacets

[{
 $searchMeta: {
  index: 'default',
  facet: {
   operator: {
    text: {
     query: 'Parameter',
     path: [
      'title',
      'notes'
     ]
    }
   },
   facets: {
    stringFacet: {
     type: 'string',
     path: 'author.name',
     numBuckets: 5
    },
    dateFacet: {
     type: 'date',
     path: 'timeStamp',
     boundaries: [
      ISODate('2020-10-13T13:33:30.000Z'),
      ISODate('2020-10-13T13:38:30.000Z'),
      ISODate('2020-10-13T13:43:30.000Z'),
      ISODate('2020-10-13T13:48:30.000Z')
     ],
     'default': 'other'
    },
    deviceFacet: {
     type: 'string',
     path: 'device'
    },
    parameterFacet: {
     type: 'string',
     path: 'parameter'
    },
    violationFacet: {
     type: 'string',
     path: 'violationType'
    }
   }
  },
  count: {
   type: 'total'
  }
 }
}]

// Data Near Bounds

[{
 $lookup: {
  from: 'launchData',
  'let': {
   device: '$device',
   parameter: '$parameter',
   startTimeStamp: {
    $dateSubtract: {
     startDate: '$timeStamp',
     unit: 'millisecond',
     amount: 500,
     timezone: 'GMT'
    }
   },
   endTimeStamp: {
    $dateAdd: {
     startDate: '$timeStamp',
     unit: 'millisecond',
     amount: 500,
     timezone: 'GMT'
    }
   }
  },
  pipeline: [
   {
    $match: {
     $expr: {
      $and: [
       {
        $eq: [
         '$meta.device',
         '$$device'
        ]
       },
       {
        $gte: [
         '$time',
         '$$startTimeStamp'
        ]
       },
       {
        $lte: [
         '$time',
         '$$endTimeStamp'
        ]
       }
      ]
     }
    }
   },
   {
    $replaceWith: {
     $arrayToObject: {
      $filter: {
       input: {
        $objectToArray: '$$CURRENT'
       },
       cond: {
        $in: [
         '$$this.k',
         [
          '$$parameter',
          'time'
         ]
        ]
       }
      }
     }
    }
   }
  ],
  as: 'metricData'
 }
}, {
 $addFields: {
  metricsCount: {
   $size: '$metricData'
  },
  metricsOnly: {
   $map: {
    input: '$metricData',
    as: 'metricObj',
    'in': {
     $let: {
      vars: {
       metricKVObj: {
        $first: {
         $filter: {
          input: {
           $objectToArray: '$$metricObj'
          },
          cond: {
           $ne: [
            '$$this.k',
            'time'
           ]
          }
         }
        }
       }
      },
      'in': '$$metricKVObj.v'
     }
    }
   }
  }
 }
}, {
 $addFields: {
  metricStats: {
   avg: {
    $avg: '$metricsOnly'
   },
   min: {
    $min: '$metricsOnly'
   },
   max: {
    $max: '$metricsOnly'
   },
   stdDev: {
    $stdDevPop: '$metricsOnly'
   },
   durationMS: {
    $subtract: [
     {
      $max: '$metricData.time'
     },
     {
      $min: '$metricData.time'
     }
    ]
   }
  }
 }
}]


// ================================================================
// Blue Origin Collections
// ================================================================
//
// IGNORE - not required for the demo
// Clean up

[{
 $replaceRoot: {
  newRoot: {
   $arrayToObject: {
    $map: {
     input: {
      $objectToArray: '$$ROOT'
     },
     as: 'kvPair',
     'in': {
      k: {
       $trim: {
        input: '$$kvPair.k'
       }
      },
      v: '$$kvPair.v'
     }
    }
   }
  }
 }
}, {
 $addFields: {
  meta: {
   device: 'lidar'
  },
  time: {
   $toDate: {
    $divide: [
     '$TIME_NANOSECONDS_TAI',
     1000000
    ]
   }
  }
 }
}, {
 $merge: {
  into: 'lidar',
  on: '_id',
  whenMatched: 'replace',
  whenNotMatched: 'fail'
 }
}]
