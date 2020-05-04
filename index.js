firebase.initializeApp({
  apiKey: 'AIzaSyDPii0fJ93DgCm9rx_ACvTQw6ph7MjBY0w',
  databaseURL: 'https://geofirestore-tests.firebaseio.com',
  projectId: 'geofirestore-tests'
});

const db = firebase.firestore();
const coordinates = new firebase.firestore.GeoPoint(0, 0);
const collection = db.collection('firebase-js-sdk-3006');

const purgeFirestore = async (collection) => {
  const batch = collection.firestore.batch();
  const docs = (await collection.limit(500).get()).docs;
  if (docs.length === 0) return;
  for (let doc of docs) { 
    batch.delete(doc.ref);
  }
  return batch.commit()
    .then(() => purgeFirestore(collection))
    .catch(() => purgeFirestore(collection));
}

function updateStatus(message) {
  const ul = document.querySelector('ul#updates');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

(async () => {
  await purgeFirestore(collection);
  updateStatus(`Purged collection "${collection.id}"`);

  const doc1 = await collection.add({ coordinates });
  updateStatus(`Added document "${doc1.id}" to collection "${collection.id}"`);

  updateStatus('Time to add new doc');
  const doc2 = await collection.add({ coordinates, posts: [doc1] });
  updateStatus(`Added document "${doc2.id}" to collection "${collection.id}"`);

  try {
    const gottenDoc2 = await doc2.get();
    console.log(gottenDoc2.data());
    updateStatus(`Queried document "${doc2.id}", check console to view it`);
  } catch (e) {
    updateStatus('ERROR: ' + e.toString());
  }
})();
