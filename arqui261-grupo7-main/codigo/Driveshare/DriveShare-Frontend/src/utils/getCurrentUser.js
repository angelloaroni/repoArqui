// src/utils/getCurrentUser.js

import users from '../data/user'

function getCurrentUser() {

  const userId =
    localStorage.getItem(
      'currentUserId'
    )

  if (!userId) {
    return null
  }

  const currentUser =
    users.find(
      user =>
        user.id_user === userId
    )

  return currentUser || null

}

export default getCurrentUser