const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const flavors = [
  'Loulou macaron',
  'Benedict macaron',
  'Petit Prince macaron',
  'Antoine macaron',
  'Papillon macaron',
  'Eve macaron',
  'Belle macaron',
  'Mimi macaron',
  'Lime-vanille',
  'Esmé macaron',
  'Yvette macaron',
  'Marie macaron',
  'Jean Charles macaron',
  'Philippe macaron',
  'Sophie macaron',
  'Aphrodité macaron',
  'Cookies and cream macaron',
  'Jean Pierre macaron',
  'Eszterházy macaron',
  'Stella macaron',
  'Noah macaron',
  'Garden of Eden macaron',
  'Isabelle macaron',
  'Anne macaron',
  'Margot macaron',
  'Laurent macaron',
  'Giselle macaron',
  'Punch macaron',
  'Adele macaron',
  'Gin tonic macaron',
  'Élise macaron',
  'Soleil macaron',
  'Mojito macaron',
  'Persephone macaron',
  'Rose macaron',
  'Arthur macaron',
  'Francis macaron',
  'Helene macaron',
  'Harmonie macaron',
  'Maxime macaron',
  'Cécile macaron',
  'Mozart macaron',
  'Amy Winehouse macaron',
  'Blanche macaron',
  'Marcel macaron',
  'Délice macaron',
  'Alice macaron',
  'Myrtille macaron',
  'Sébastien macaron',
  'Carmen macaron',
  'Mákos guba macaron',
  'Renée macaron',
  'Somlói macaron',
  'Szilvás gombóc macaron',
  'Som macaron',
  'Raphael macaron',
  'Charlotte macaron',
  'Joie macaron',
  'Pauline macaron',
  'Olivier macaron',
  'Sparkling wine macaron',
  'Gabriel macaron',
  'Noel macaron',
  'Hervé macaron',
  'Hugo macaron',
  'Priscille macaron',
  'Joanne macaron',
  'Baileys macaron',
  'Céline macaron',
  'Artemis macaron',
];

const filePath = path.join(process.cwd(), 'waste.csv');
const csvData = fs.readFileSync(filePath, 'utf8');

const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
});

function tryToParseDate(date) {
  return date
    .split('.')
    .filter(Boolean)
    .map((d) => d.trim())
    .join('-');
}

const mappedRecords = records
  .map((record) => {
    const displayedQuantity = parseInt(record['pultba db'], 10) || 0;
    const releaseDate = tryToParseDate(record['kitárolás dátuma']);
    const manufacturingDate = tryToParseDate(record['gyártás dátuma']);
    const displayDate = tryToParseDate(record['pultba kerülés']);

    if (
      displayedQuantity === 0 ||
      !releaseDate ||
      !displayDate ||
      !manufacturingDate
    ) {
      return null;
    }

    if (
      !releaseDate.match(/^\d{4}-\d{2}-\d{2}$/) ||
      !displayDate.match(/^\d{4}-\d{2}-\d{2}$/) ||
      !manufacturingDate.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return null;
    }

    let flavor = record['Macaron íz'];

    if (flavor === 'Cécile macron') {
      flavor = 'Cécile macaron';
    }

    if (flavor === 'Rose macron') {
      flavor = 'Rose macaron';
    }

    return {
      flavor,
      displayedQuantity,
      releaseDate,
      manufacturingDate,
      displayDate,
      shippingWasteQuantity: parseInt(record['selejt db'], 10) || 0,
      manufacturingWasteQuantity: 0,
      // manufacturingWasteReason: record['problémák']
      //   .split(',')
      //   .filter((r) => r.trim() !== '-')
      //   .map((r) => {
      //     const reason = r.trim();
      //     if (!reason) {
      //       return null;
      //     }
      //     return {
      //       reason,
      //     };
      //   })
      //   .filter(Boolean),
    };
  })
  .filter(Boolean);

// mappedRecords.forEach((r) => {
//   if (!r.displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
//     throw new Error(`meh: ${r.displayDate}`);
//   }
// });

const WasteItemSchema = z.object({
  flavor: z.enum(flavors),
  displayedQuantity: z.coerce.number().gt(0),
  manufacturingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  displayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  manufacturingWasteReason: z
    .array(
      z.object({
        reason: z.string(),
      })
    )
    .optional(),
});

const WasteArraySchema = z.array(WasteItemSchema);

const result = WasteArraySchema.safeParse(mappedRecords);

if (!result.success) {
  console.log(result.error.issues);
}

// console.log(mappedRecords.length);

// Convert to CSV string
const csv = stringify(mappedRecords, {
  header: true, // Include column names
  columns: Object.keys(mappedRecords[0]), // Optional, but good for consistency
});

console.log(csv);

fs.writeFileSync('./import.csv', csv);
