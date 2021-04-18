//Users Object
const users = {
  "randomUserOne": {
    id: "randomUserID",
    email: "user@example.com",
    password: "$2b$10$DXG/ne.DGRUYBXtwmWpqsOFKdg12fGs31zzn8YWQwZkXmsN6nzMhW"
  },
  "randomUserTwo": {
    id: "randomUser2ID",
    email: "user2@example.com",
    password: "daschunds-rock"
  }
};

//Access Users Database emails
function getUserEmail(email) {
  for (let id in users) {
    if (users[id].email === email) {
      console.log(users[id]);
      return users[id];
    }
  }
  return null;
};


module.exports.getUserEmail = getUserEmail;

