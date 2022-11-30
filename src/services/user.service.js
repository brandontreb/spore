const SporeStore = require('../store');
const passwordHash = require('password-hash');

const updateUser = async(userId, userBody) => {
  const user = await SporeStore.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // If the password is being updated, hash it
  const { password } = userBody;
  if (password && password.length > 0) {
    userBody.password = passwordHash.generate(password);
  }
  // Update the user and return it
  const updatedUser = await SporeStore.updateUser(userId, userBody);
  return updatedUser;
}

const getUserByEmailOrUsername = async(emailOrUsername) => {
  return await SporeStore.getUserByEmailOrUsername(emailOrUsername);
}

module.exports = {
  updateUser,
  getUserByEmailOrUsername
}