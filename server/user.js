const users = [];

export const addUser = (id,account) => {
  const user = {
    id: id, 
    ...account
  }
  users.push(user);
  return { user };
};

export const removeUser = (email) => {
  const index = users.findIndex((user) => user.email === email);

  if (index !== -1) return users.splice(index, 1)[0];
};

export const getUser = (id) => users.find((user) => user.id === id);

export const getUsersInRoom = (room) =>
  users.filter((user) => user.room === room);
