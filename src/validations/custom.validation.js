const userName = (value, helpers) => {
  if (value.length > 5) {
    return helpers.message('user name must be greater than 5 characters');
  }
  if (!value.match(/[a-zA-Z]/)) {
    return helpers.message(
      'user name must contain at least 1 letter and 1 number',
    );
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 5) {
    return helpers.message('password must be at least 5 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      'password must contain at least 1 letter and 1 number',
    );
  }
  return value;
};

module.exports = {
  password,
  userName,
};
