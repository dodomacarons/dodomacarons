const fs = require('fs');
const path = require('path');
const flavorsFromDb = require('./input/flavors.json');
const reasonsFromDb = require('./input/reasons.json');
const obsoleteWastes = require('./input/waste.json');

let numberOfUnknownFlavors = 0;

const mapped = obsoleteWastes.map((waste) => {
  const flavorWithObjectId = flavorsFromDb.find(
    (flavorFromDb) =>
      flavorFromDb.name === waste.flavor ||
      `${flavorFromDb.name} macaron` === waste.flavor,
  );
  if (flavorWithObjectId) {
    waste.flavor = { $oid: flavorWithObjectId._id.$oid };
  } else {
    console.error('registered flavor not found');
    numberOfUnknownFlavors++;
  }

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

  delete waste.__v;

  return waste;
});

console.log('Number of unknown flavors: ', numberOfUnknownFlavors);

// console.log(mapped);

fs.writeFileSync(
  path.join(
    process.cwd(),
    './scripts/output/import-updated-obsolete-waste.json',
  ),
  JSON.stringify(mapped),
);
