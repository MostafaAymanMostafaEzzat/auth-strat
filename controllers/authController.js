const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser,  sendResetPasswordEmail,
  sendVerificationEmail } = require('../utils');
const cyrpto = require('crypto');


const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({ name, email, password, role });
  const tokenUser = createTokenUser(user);
  const verificationToken = cyrpto.randomBytes(40).toString('hex');
  const origin = 'https://react-3t4g.onrender.com';


  //send Email
 await sendVerificationEmail({name:user.name,email:user.email,verificationToken,origin})
// console.log(req.headers['x-forwarded-host'])
//save the verificationToken to the user
// user.verificationToken=verificationToken

  res.status(StatusCodes.CREATED).json({ msg: 'Success! Please check your email to verify account'});
};




const verifyEmail= async (req,res) =>{
const {email,verificationToken}=req.body
if (!email || !verificationToken) {
  throw new CustomError.BadRequestError(' email and verificationToken not found');
}
const user=await User.findOne({email})
if (!user) {
  throw new CustomError.UnauthenticatedError('Verification Failed');
}
if (!verificationToken === user.verificationToken) {
  throw new CustomError.UnauthenticatedError('Verification Failed');
}

user.isVerified=true
user.verifiedDate=new Date.now()
user.verificationToken = '';
await user.save();

res.status(StatusCodes.OK).json({msg:'Email Verified'})



}
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = {
  register,
  login,
  verifyEmail,
  logout,
};
