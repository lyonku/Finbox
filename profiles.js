const { getProfiles } = require('./db.js');

const addProfile = async (userId, profile) => {
  const profiles = await getProfiles();

  await profiles.updateOne({ _id: userId }, { $set: { ...profile } }, { upsert: true });
}

const findProfile = async (userId) => {
  if (!userId) {
    return;
  }
  const profiles = await getProfiles();

  return profiles.findOne({_id: userId});
}

exports.addProfile  = addProfile;
exports.findProfile = findProfile;
