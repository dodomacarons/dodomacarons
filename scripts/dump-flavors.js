const fs = require('fs');
const path = require('path');

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
  'White Rabbit',
  'Infiniment Cocholat',
  'Eat me',
  'Barbara',
  'Violet',
];

const parsed = flavors.map((flavor) => ({
  name: flavor
    .replace(/macaron/gi, '')
    .replace(/\s+/g, ' ')
    .trim(),
  createdAt: { $date: new Date() },
}));

console.log(parsed);

fs.writeFileSync(
  path.join(process.cwd(), './scripts/output/import-flavors.json'),
  JSON.stringify(parsed),
);
