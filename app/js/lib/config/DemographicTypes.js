(function () {
  'use strict';

  module.exports = {
    child: {
      work: false,
      fertility: false,
      size: {
        from: 0,
        to: 3
      },
      lifespan: {
        from: 13,
        to: 16
      }
    },
    youngAdult: {
      work: {
        from: 0.4,
        to: 0.5
      },
      fertility: {
        from: 0.1,
        to: 0.1
      },
      size: {
        from: 3,
        to: 5
      },
      lifespan: {
        from: 2,
        to: 2
      }
    },
    adult: {
      work: {
        from: 0.7,
        to: 0.8
      },
      fertility: {
        from: 0.5,
        to: 0.7
      },
      size: {
        from: 3,
        to: 10
      },
      lifespan: {
        from: 40,
        to: 45
      }
    },
    old: {
      work: {
        from: 0.3,
        to: 0.5
      },
      fertility: {
        from: 0.1,
        to: 0.3
      },
      size: {
        from: 0,
        to: 6
      },
      lifespan: {
        from: 20,
        to: 30
      }
    }
  };
}());
