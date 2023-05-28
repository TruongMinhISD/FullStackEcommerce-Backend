import jwt from 'jsonwebtoken';
export const generateAuthToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const decodeAuthToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
