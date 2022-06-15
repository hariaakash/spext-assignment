const mongoose = require('mongoose');

module.exports = {
  getAnalytics: ({ user }) => {
    const pipeline = [];

    const $match = {
      status: true,
    };
    if (user) $match.user = mongoose.Types.ObjectId(user);

    if (Object.keys($match).length) pipeline.push({ $match });

    pipeline.push(...[
      {
        $facet: {
          views: [
            {
              $group: {
                _id: null,
                count: { $sum: '$views' },
              },
            },
          ],
          duration: [
            {
              $group: {
                _id: null,
                count: { $sum: '$duration' },
              },
            },
          ],
          durationAvg: [
            {
              $group: {
                _id: null,
                count: { $avg: '$duration' },
              },
            },
          ],
          size: [
            {
              $group: {
                _id: null,
                count: { $sum: '$size' },
              },
            },
          ],
          sizeAvg: [
            {
              $group: {
                _id: null,
                count: { $avg: '$size' },
              },
            },
          ],
          mediaTypes: [
            {
              $group: {
                _id: '$codecType',
                count: { $sum: 1 },
              },
            },
          ],
          formats: [
            {
              $project: {
                formats: 1,
              },
            },
            {
              $unwind: '$formats',
            },
            {
              $group: {
                _id: '$formats',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return pipeline;
  },
};
