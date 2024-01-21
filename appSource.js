const { store, config } = require('./firestore.js')

const visits = store.collection('visits');

let offers = [];
const loadOffers = async () => {
  const template = await config.getTemplate();
  let res = JSON.parse(template.parameters.siteOffersFromApp.conditionalValues.Kazakhstan.value)
  if (offers.length === 0) {
    console.log('Offers for app loaded')
  }
  offers = res
};

console.log('Load app offers...');
loadOffers();
setInterval(loadOffers, 5 * 60 * 1000);

const getPreferOffer = (id) => offers.find(offer => offer.id === id)

const findUserDoc = async (linkId) => {
  if (!linkId) {
    return;
  }
  const snapshot = await visits.where('linkId', '==', linkId).get();

  if (snapshot.empty) {
    console.error('Snapshot is empty', linkId);

    return;
  }
  const doc = snapshot.docs[0];
  if (!(doc && doc.exists)) {
    console.error('No doc found', linkId);

    return;
  }

  return snapshot.docs[0];
}

const findOffer = async (linkId, preferOfferId) => {
  const doc = await findUserDoc(linkId);
  if (!doc) {
    return getPreferOffer(preferOfferId) ?? offers[0];
  }

  let visitedIds = doc.data().visitedIds;

  let offerToRedirect = getPreferOffer(preferOfferId);
  if (offerToRedirect) {
    visitedIds.push(offerToRedirect.id);
  } else {
    offerToRedirect = offers.find(element => !visitedIds.includes(element.id));
    if (offerToRedirect === undefined) {
      console.log('User visited all offers, redirecting to default', linkId);
      offerToRedirect = offers[0];

      visitedIds = [offerToRedirect.id]
    } else {
      visitedIds.push(offerToRedirect.id);
    }
  }

  await visits.doc(doc.id).update({
    visitedIds: visitedIds
  });

  return offerToRedirect;
}

const getOffers = async (linkId, req) => {
  const query = req._parsedUrl.query // FIXME: CSRF attack
  let userOffers = offers.map((offer) => {
    return {
      ...offer,
      url: `/go/${offer.id}/?${query}`
    }
  })

  try {
    const userDoc = await findUserDoc(linkId);
    if (userDoc) {
      const visitedIds = userDoc.data().visitedIds;
      const newOffers = userOffers.filter(offer => !visitedIds.includes(offer.id))
      const restOffers = userOffers.filter(offer => visitedIds.includes(offer.id))
      userOffers = [...newOffers, ...restOffers];
    }
  } catch (e) {
    console.error(e)
  }

  userOffers.map((offer, index) => {
    offer.approvingChance = index === 0 ? 98 : (97 - index * 3)
  })

  return userOffers
}


exports.findOffer = findOffer;
exports.getOffers = getOffers;
