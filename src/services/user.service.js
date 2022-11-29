const SporeStore = require('../store');
const passwordHash = require('password-hash');

// const createUser = async (userBody) => {  
//   const user = await db.Users.create(userBody);
//   return user;
// };

const updateUser = async(userId, userBody) => {
  const user = await SporeStore.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const { password } = userBody;
  if (password && password.length > 0) {
    userBody.password = passwordHash.generate(password);
  }

  console.log('Updating user %d with body %o', userId, userBody);
  const updatedUser = await SporeStore.updateUser(userId, userBody);
  return updatedUser;
}

// const getUser = async (userId) => {
//   try {
//     const user = await db.Users.findByPk(userId);
//     return user;
//   } catch (err) {
//     console.log(err);
//   }
//   return null;
// }

const getUserByEmailOrUsername = async(emailOrUsername) => {
  return await SporeStore.getUserByEmailOrUsername(emailOrUsername);
}

module.exports = {
  // createUser,
  updateUser,
  // getUser,
  getUserByEmailOrUsername
}