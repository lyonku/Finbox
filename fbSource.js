const { config } = require('./firestore.js');
const { getVisits } = require('./db.js');

let offers = [];
const loadOffers = async () => {
  const template = await config.getTemplate();
  let res = JSON.parse(template.parameters.siteOffersFromFacebook.conditionalValues.Kazakhstan.value)
  if (offers.length === 0) {
    console.log('Offers for fb loaded')
  }
  offers = res
};

console.log('Load fb offers...');
loadOffers();
setInterval(loadOffers, 5 * 60 * 1000);


const getPreferOffer = (id) => offers.find(offer => offer.id === id)

const findVisit = async (userId) => {
  if (!userId) {
    return;
  }
  const visits = await getVisits();

  const doc = await visits.findOne({_id: userId});

  if (!doc) {
    console.error('Visit is empty', userId);

    return {
      _id: userId,
      visitedIds: [],
    };
  }

  return doc;
}

const findOffer = async (userId, preferOfferId) => {
  const doc = await findVisit(userId);
  if (!doc) {
    return getPreferOffer(preferOfferId) ?? offers[0];
  }

  let visitedIds = doc.visitedIds ?? [];

  let offerToRedirect = getPreferOffer(preferOfferId);
  if (offerToRedirect) {
    visitedIds.push(offerToRedirect.id);
  } else {
    offerToRedirect = offers.find(element => !visitedIds.includes(element.id));
    if (offerToRedirect === undefined) {
      console.log('User visited all offers, redirecting to default', userId);
      offerToRedirect = offers[0];

      visitedIds = [offerToRedirect.id]
    } else {
      visitedIds.push(offerToRedirect.id);
    }
  }

  const visits = await getVisits();
  await visits.updateOne({ _id: userId }, { $set: { visitedIds } }, { upsert: true });

  return offerToRedirect;
}

const getOffers = async (userId, req) => {
  const query = req._parsedUrl.query // FIXME: CSRF attack
  let userOffers = offers.map((offer) => {
    return {
      ...offer,
      url: `/go/${offer.id}?${query}`
    }
  })

  try {
    const visit = await findVisit(userId);
    if (visit) {
      const visitedIds = visit.visitedIds ?? [];
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
