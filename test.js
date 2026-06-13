const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function check(testName, condition) {
    if (condition) {
        console.log('PASS: ' + testName);
        passed = passed + 1;
    } else {
        console.log('FAIL: ' + testName);
        failed = failed + 1;
    }
}

async function runTests() {

    // Scenario 1: Create a resource with capacity 5
    const res1 = await fetch(BASE_URL + '/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Cinema', total_capacity: 5 })
    });
    const data1 = await res1.json();

    check('Scenario 1: create resource with capacity 5', res1.status === 201 && data1.available === 5);

    const resourceId = data1.id;

    // Scenario 2: Reserve 3 units — expect success
    const res2 = await fetch(BASE_URL + '/resources/' + resourceId + '/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserver_name: 'Ali', quantity: 3 })
    });

    check('Scenario 2: reserve 3 units - expect success', res2.status === 201);


    // Scenario 3: Reserve 3 more units — expect failure (exceeds capacity)
    const res3 = await fetch(BASE_URL + '/resources/' + resourceId + '/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserver_name: 'Sara', quantity: 3 })
    });

    check('Scenario 3: reserve 3 more - expect failure (exceeds capacity)', res3.status === 400);


    // Scenario 4: Reserve 2 units — expect success (exactly fills remaining stock)
    const res4 = await fetch(BASE_URL + '/resources/' + resourceId + '/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserver_name: 'Omar', quantity: 2 })
    });

    check('Scenario 4: reserve 2 units - expect success (fills remaining)', res4.status === 201);


    // Scenario 5: Reserve 1 unit — expect failure (no stock left)
    const res5 = await fetch(BASE_URL + '/resources/' + resourceId + '/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserver_name: 'Lina', quantity: 1 })
    });

    check('Scenario 5: reserve 1 unit - expect failure (no stock left)', res5.status === 400);


    // Summary
    console.log('');
    console.log('Total passed: ' + passed);
    console.log('Total failed: ' + failed);

}

runTests();