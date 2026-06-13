# Inventory Reservation API

A REST API to manage reservations for limited-capacity resources, like cinema seats or product stock.

Built with Node.js, Express, and SQLite using raw SQL queries.

## How to run

Clone the repo, then:

```bash
npm install
node server.js
```

Server starts at `http://localhost:3000`.

## How it works

When the server starts, it creates a `data.db` SQLite file with two tables — `resources` and `reservations`.

I chose to calculate `available` dynamically every time (total_capacity minus the sum of all reservations) rather than storing it as a column. This way there's only one source of truth and it can never go out of sync.

## API

**POST /resources**  
Create a new resource with a name and total capacity.

```json
{ "name": "Cinema Row 1", "total_capacity": 5 }
```

**GET /resources/:id**  
Get a resource by id. Returns total and available capacity.

**POST /resources/:id/reservations**  
Reserve a quantity. Rejects if quantity isn't a positive integer or if it exceeds what's available.

```json
{ "reserver_name": "Ali", "quantity": 3 }
```

**GET /resources/:id/reservations**  
List all reservations for a resource.

## Running the tests

Make sure the server is running first, then in another terminal:

```bash
node test.js
```

The test script runs 5 scenarios in order against a fresh resource with capacity 5:

1. Create a resource with capacity 5 — expects success
2. Reserve 3 units — expects success (5 available, 3 requested)
3. Reserve 3 more units — expects failure (only 2 left, 3 requested)
4. Reserve 2 units — expects success (exactly fills the remaining stock)
5. Reserve 1 unit — expects failure (0 available, nothing left)

All 5 scenarios print PASS or FAIL. A correct implementation should show 5/5 passing.

## Notes

There's no cancellation endpoint, so all reservations stay active. The GET reservations endpoint returns everything for that resource.