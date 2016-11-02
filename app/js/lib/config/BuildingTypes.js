(function () {
  'use strict';

  module.exports = {
    'radio tower': {
      name: 'Radio Tower',
      id: 'b-1',
      amountToBuild: 50,
      dependsOn: null,
      mutators: {
        local: [
          {
            to: 'population',
            by: 0.2
          },
          {
            to: 'happiness',
            by: 5,
            buff: true
          }
        ],
        global: [
          {
            to: 'happiness',
            by: 2,
            buff: true
          }
        ]
      }
    },
    'granary': {
      name: 'Granary',
      id: 'b-2',
      amountToBuild: 34,
      dependsOn: null,
      mutators: {
        local: [
          {
            to: 'food',
            by: 0.1
          }
        ],
        global: []
      }
    },
    'refinery': {
      name: 'Refinery',
      id: 'b-3',
      amountToBuild: 20,
      dependsOn: null,
      mutators: {
        local: [
          {
            to: 'work',
            by: 1.5,
            buff: true
          }
        ],
        global: []
      }
    }
  };

}());
