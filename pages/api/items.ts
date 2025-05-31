export default function handler(req, res) {
  const items = [
    { id: 1, name: 'Bonsai 1', type: 'bonsai' },
    { id: 2, name: 'Tool 1', type: 'tool' },
    { id: 3, name: 'Accessory 1', type: 'accessory' },
    // ...other items
  ];

  res.status(200).json(items);
}
