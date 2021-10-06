# @flamedb/next

The next version for FlameDB. A lightweight firebase firestore wrapper with a compact and complete features.
FlameDB provides methods that are easy to understand and beginner friendly. Inspired by quick.db, FlameDB methods are very similar except that FlameDB works with a cloud database (firebase firestore).

## Installation
1. run `npm install @flamedb/next` or `yarn add @flamedb/next`.
2. You can start working!

## Examples
```js
const FlameDB = require('@flamedb/next');
const db = new FlameDB();

db.on('connect', async () => {

    // Create a new collection with a doc named 'repyh' that has a value of below.
    await db.create('user.repyh', { dumb: true });

    // Set an existing document and set the 'dumb' property to false (bc Im not dumb).
    await db.set('user.repyh.dumb', false);

    // Get the value for 'dumb' property which in this case will return false
    await db.get('user.repyh.dumb');

});

db.connect(service_account);
```

## Service Account
Getting service account is quite easy.
1. Go to your firebase console and open 'Project Settings'.
2. Go to 'Service accounts' tab and click 'create new private key'.
3. After downloading the key, we'll only need 3 things from the json file; client_email, project_id, and private_key.
4. Next, set the service account in a secret folder (especially private_key, you can use .env file to store).
5. Do as below
```js
db.connect({
    privateKey: '...', // Your private key.
    clientEmail: '...', // Your client email.
    projectId: '...' /// Your project id.
})
```

## Support & Bugs
Please wait until further information.