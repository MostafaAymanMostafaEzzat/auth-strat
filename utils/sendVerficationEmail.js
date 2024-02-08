const sendEmail =require('./sendEmail');

const sendVerificationEmail = async ({name,email,verificationToken,origin})=>{

const URL =`${origin}/user/verify-email?token=${verificationToken}&email=${email}`
const message=`<p>Please confirm your email by clicking on the following link : 
<a href="${URL}">Verify Email</a> </p>`;

return sendEmail({
     to:email,
     subject:'Email Confirmation',
     html:`<h4>hello, ${name}:</h4>
     ${message}`
})

}

module.exports=sendVerificationEmail