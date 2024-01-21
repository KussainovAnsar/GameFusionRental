const faker = require('faker');
const { MongoClient } = require('mongodb');

async function generateFakeData() {
  const client = new MongoClient('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to the database');

    const db = client.db('GameFusion');

    // Generate fake customers
    const customers = [];
    for (let i = 0; i < 1000; i++) {
      const rentalHours = faker.random.number({ max: 3000 });
      const status = rentalHours > 1000 ? 'Diamond' : (rentalHours >= 300 ? 'Gold' : 'Silver');

      customers.push({
        customer_id: i + 1,
        name: faker.name.firstName(),
        surname: faker.name.lastName(),
        contact: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        id_card: faker.random.number({ min: 100000000000, max: 999999999999 }).toString(),
        rental_hours: rentalHours,
        status: status,
        rental_history: [], // Embedded document for rental history
      });
    }

    // Generate fake consoles
    const consoles = [];
    const consoleTypes = ['PlayStation4', 'PlayStation5', 'Xbox Series X'];
    for (const type of consoleTypes) {
      for (let i = 0; i < 20; i++) {
        consoles.push({
          console_id: consoles.length + 1,
          type: type,
          availability: true,
          rental_hours: 0,
          rental_history: [], // Embedded document for rental history
        });
      }
    }

    // Generate fake locations
    const locations = [];
    for (let i = 0; i < 400; i++) {
      locations.push({
        location_id: i + 1,
        name: faker.address.city(),
        address: faker.address.streetAddress(),
      });
    }

    // Generate fake rentals
    const rentals = [];
    for (let i = 0; i < 1000; i++) {
      const customer = faker.random.arrayElement(customers);
      const console = faker.random.arrayElement(consoles);
      const location = faker.random.arrayElement(locations);

      const rental = {
        rental_id: i + 1,
        customer_id: customer.customer_id,
        console_id: console.console_id,
        location_id: location.location_id,
        rental_type: i < 400 ? 'home delivery' : 'in-store', // 400 home delivery, 600 in-store
        duration: faker.random.number({ min: 2, max: 24 }), // Random duration between 2 and 24 hours
        deposit: parseInt(customer.id_card), // ID card as deposit
        total_cost: (2 + faker.random.number({ min: 1, max: 22 })) * 1000, // Random total cost (minimum rent duration is 2 hours)
      };

      rentals.push(rental);
      // Update rental_hours for consoles and customers
      console.rental_hours += rental.duration;
      customer.rental_hours += rental.duration;
      // Update rental_history in customers and consoles
      customer.rental_history.push(rental);
      console.rental_history.push(rental);
    }

    // Insert data into MongoDB
    await db.collection('customers').insertMany(customers);
    await db.collection('consoles').insertMany(consoles);
    await db.collection('locations').insertMany(locations);
    await db.collection('rentals').insertMany(rentals);

    console.log('Fake data generated and inserted into MongoDB');
  } finally {
    await client.close();
    console.log('Connection to the database closed');
  }
}

generateFakeData();
