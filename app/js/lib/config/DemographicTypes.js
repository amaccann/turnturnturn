(function () {
  'use strict';

  module.exports = {
    child: {
      production: false,
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
      production: {
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
        from: 1,
        to: 3
      }
    },
    adult: {
      production: {
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
      production: {
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
