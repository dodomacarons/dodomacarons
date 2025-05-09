const fs = require('fs');
const path = require('path');
const reasonsFromDb = require('./input/reasons.json');
const parsedWasteFromOldDb = require('./output/import.json');

const mapped = parsedWasteFromOldDb.map((waste) => {
  if (
    waste.manufacturingWasteReason &&
    waste.manufacturingWasteReason.length > 0
  ) {
    waste.manufacturingWasteReason = waste.manufacturingWasteReason.map(
      ({ reason }) => {
        const reasonWithObjectId = reasonsFromDb.find(
          (reasonFromDb) => reasonFromDb.name === reason,
        );
        if (reasonWithObjectId) {
          return {
            reason: { $oid: reasonWithObjectId._id.$oid },
          };
        }
        return { reason };
      },
    );
  }

  return waste;
});

// console.log(mapped);

fs.writeFileSync(
  path.join(process.cwd(), './scripts/output/import.json'),
  JSON.stringify(mapped),
);
