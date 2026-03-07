const catalogNames = [
  'spankbang',
  'missav',
  'xvideos',
  'javhd',
  'javseen',
  'javcl',
  'javgg'
];

// Load and instantiate providers correctly
const providers = catalogNames.map((name) => {
  const ProviderClass = require(`./${name}`);
  return new ProviderClass();
});

module.exports = providers;