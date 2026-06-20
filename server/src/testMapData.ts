import { USA_CITIES, USA_ROUTES, USA_DESTINATION_TICKETS } from './usaMapData.js';
import { INDIA_CITIES, INDIA_ROUTES, INDIA_DESTINATION_TICKETS } from './indiaMapData.js';

function validateMap(name: string, cities: any[], routes: any[], tickets: any[]) {
  console.log(`\n=== Validating ${name} Map ===`);
  const cityNames = new Set(cities.map(c => c.name));
  let errors = 0;

  // Validate Routes
  for (const r of routes) {
    if (!cityNames.has(r.city1)) {
      console.error(`Error in route ${r.id}: city1 "${r.city1}" is not defined in cities list.`);
      errors++;
    }
    if (!cityNames.has(r.city2)) {
      console.error(`Error in route ${r.id}: city2 "${r.city2}" is not defined in cities list.`);
      errors++;
    }
  }

  // Validate Tickets
  for (const t of tickets) {
    if (!cityNames.has(t.city1)) {
      console.error(`Error in ticket ${t.id}: city1 "${t.city1}" is not defined in cities list.`);
      errors++;
    }
    if (!cityNames.has(t.city2)) {
      console.error(`Error in ticket ${t.id}: city2 "${t.city2}" is not defined in cities list.`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log(`✅ ${name} Map is 100% valid! Checked ${cities.length} cities, ${routes.length} routes, and ${tickets.length} tickets.`);
  } else {
    console.error(`❌ Found ${errors} error(s) in ${name} Map.`);
  }
  return errors;
}

const errUsa = validateMap("USA", USA_CITIES, USA_ROUTES, USA_DESTINATION_TICKETS);
const errIndia = validateMap("India", INDIA_CITIES, INDIA_ROUTES, INDIA_DESTINATION_TICKETS);

if (errUsa + errIndia > 0) {
  process.exit(1);
} else {
  console.log("\n🎉 All map data sets are completely consistent!");
  process.exit(0);
}
