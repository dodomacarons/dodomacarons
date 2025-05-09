const fs = require('fs');
const path = require('path');
const flavorsFromDb = require('./input/flavors.json');
const parsedWasteFromOldDb = require('./output/import.json');

let numberOfUnknownFlavors = 0;
const mapped = parsedWasteFromOldDb.map((waste) => {
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
  return waste;
});

console.log('Number of unknown flavors: ', numberOfUnknownFlavors);

// console.log(mapped);

fs.writeFileSync(
  path.join(process.cwd(), './scripts/output/import.json'),
  JSON.stringify(mapped),
);
