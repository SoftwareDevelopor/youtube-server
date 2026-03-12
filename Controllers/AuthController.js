const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const user = require('../Models/User_Auth')
const nodemailer = require('nodemailer')

exports.register = async (request, response) => {
  if (!request || !request.body) {
    const obj = {
      status: false,
      msg: "No data provided",
      _data: null
    }
    return response.send(obj)
  }

  var existingUser = await user.findOne({ email: request.body.email, deleted_at: null })
  if (existingUser) {
    const obj = {
      status: false,
      msg: "User with this email already exists",
      _data: null
    }
    return response.send(obj)
  }

  let saltRounds = 10
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds)
  const newUser = {
    name: request.body.name,
    email: request.body.email,
    password: hashedPassword,
    mobile_number: request.body.mobile_number
  }

  if (request.file) {
    newUser.image = request.file.filename
  }


  try {
    const insertdata = await user(newUser)
    const result = await insertdata.save()
    var token = jwt.sign({ userdata: result }, process.env.secret_key)
    const objectdata = {
      status: true,
      msg: "User registered successfully",
      _data: result,
      token: token,
    }
    return response.send(objectdata)
  } catch (error) {
    var errormessages = [];
    for (let err in error.errors) {
      errormessages.push(error.errors[err].message);
    }
    const output = {
      status: false,
      msg: "Something went wrong",
      _data: error,
      errorMsg: errormessages,
    };
    return response.send(output);
  }
}

exports.login = async (request, response) => {

  let loginobj = {
    email: request.body.email,
    password: request.body.password
  }
  const existingUser = await user.findOne({ email: loginobj.email, deleted_at: null })
  if (!existingUser) {
    const obj = {
      status: false,
      msg: "User not found",
      _data: null
    }
    return response.send(obj)
  }

  const isMatch = await bcrypt.compare(loginobj.password, existingUser.password)
  if (!isMatch) {
    const obj = {
      status: false,
      msg: "Invalid password",
      _data: null
    }
    return response.send(obj)
  }

  if (existingUser.status == false) {
    const obj = {
      status: false,
      msg: "Your account has been deactivated. Please contact support.",
      _data: null
    }
    return response.send(obj)
  }
  var token = jwt.sign({ userdata: existingUser }, process.env.secret_key)

  const objectdata = {
    status: true,
    msg: "User logged in successfully",
    _data: existingUser,
    token: token,
  }
  return response.send(objectdata)
}

exports.getallusers = async (request, response) => {
  try {
    const users = await user.find({ deleted_at: null }).populate("videoIds");
    if (!users || users.length === 0) {
      return response.send({
        status: false,
        msg: "No users found",
        _data: []
      });
    }
    const obj = {
      status: true,
      msg: "Users fetched successfully",
      _data: users,
      imagepath:"http://localhost:5000/uploads/users/"
    }
    return response.send(obj)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Error fetching users",
      _data: error
    }
    return response.send(obj)
  }
}

exports.viewProfile = async (request, response) => {

  var token = request.headers.authorization;
  if (!token) {
    const obj = {
      status: false,
      msg: "No token provided",
      _data: null
    }
    return response.send(obj)
  }
  try {
    var token = token.split(" ")[1];
    var decoded = jwt.verify(token, process.env.secret_key);
    var userdataid = decoded.userdata._id;
    var userdata = await user.findOne({ _id: userdataid, deleted_at: null }).populate('videoIds').populate('subscribed_channels');
    if (!userdata) {
      const obj = {
        status: false,
        msg: "User not found",
        _data: null
      }
      return response.send(obj)
    }
    const objectdata = {
      status: true,
      msg: "User profile fetched successfully",
      _data: userdata,
      image_url: "http://localhost:5000/uploads/users/"
    }
    return response.send(objectdata)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Invalid token",
      _data: null
    }
    return response.send(obj)
  }
}

exports.updateprofile = async (request, response) => {
  
  var token = request.headers.authorization;
  if (!token) {
    const obj = {
      status: false,
      msg: "No token provided",
      _data: null
    }
    return response.send(obj)
  }
  try {
    var token = token.split(" ")[1];
    var decoded = jwt.verify(token, process.env.secret_key);
    var userdataid = decoded.userdata._id;
    var userdata = await user.findOne({ _id: userdataid, deleted_at: null });
    if (!userdata) {
      const obj = {
        status: false,
        msg: "User not found",
        _data: null
      }
      return response.send(obj)
    }
    let updateData = request.body;
   
    let userupdatedata = await user.updateOne(
      {
        _id: userdataid
      },
      {
        $set: updateData
      }
    )
    const objectdata = {
      status: true,
      msg: "User profile updated successfully",
      _data: userupdatedata,
      token: token,
    }
    return response.send(objectdata)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Error updating profile",
      _data: error
    }
    return response.send(obj)
  }
}

exports.uploadChannelBanner = async (request, response) => {
 
  let token = request.headers.authorization;
  if (!token) {
    const obj = {
      status: false,
      msg: "No token provided",
      _data: null
    }
    return response.send(obj)
  }
 if (!request.file) {
    const obj = {
      status: false,
      msg: "No file provided",
      _data: null
    }
    return response.send(obj)
  }
  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.secret_key);
    const userdataid = decoded.userdata._id;
    const userdata = await user.findOne({ _id: userdataid, deleted_at: null });

    if (!userdata) {
      const obj = {
        status: false,
        msg: "User not found",
        _data: null
      }
      return response.send(obj)
    }

    // Update the channel banner image
    const userupdatedata = await user.updateOne(
      {
        _id: userdataid
      },
      {
        $set: {
          channel_banner_image: request.file.filename
        }
      }
    )

    const objectdata = {
      status: true,
      msg: "Channel banner uploaded successfully",
      _data: userupdatedata,
      filename: request.file.filename,
      token: token,
    }
    return response.send(objectdata)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Error uploading channel banner",
      _data: error
    }
    return response.send(obj)
  }
}

exports.changepassword = async (request, response) => {
  let token = request.headers.authorization;
  if (!token) {
    return response.send({
      status: false,
      msg: "No Token Provided. So, Token is required",
      _data: [],
    });
  }
  try {
    token = token.split(" ")[1]; // Bearer <token> format in header is splitted to get only token part
    let decoded = jwt.verify(token, "123456");
    let userdataid = decoded.userdata._id;
    var userData = await user.findOne({ _id: userdataid, deleted_at: null });
    if (!userData) {
      return response.send({
        status: false,
        msg: "User not found",
        _data: [],
      });
    }

    var currentPassword = request.body.current_password;
    var newPassword = request.body.new_password;
    var confirmPassword = request.body.confirm_password;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return response.send({
        status: false,
        msg: "current_password, new_password and confirm_password are required",
        _data: [],
      });
    }

    let verifypassword = await bcrypt.compare(
      currentPassword,
      userData.password
    );
    if (!verifypassword) {
      return response.send({
        status: false,
        msg: "Invalid current password",
        _data: [],
      });
    }

    if (currentPassword == newPassword) {
      return response.send({
        status: false,
        msg: "New password and Current password cannot be same",
        _data: [],
      });
    }

    if (newPassword != confirmPassword) {
      return response.send({
        status: false,
        msg: "New password and Confirm password must be same",
        _data: [],
      });
    }
    var Changedpassword = await bcrypt.hash(newPassword, 10);
    var userupdatedata = await user.updateOne(
      {
        _id: userdataid,
      },
      {
        $set: { password: Changedpassword },
      }
    );
    const result = {
      _status: true,
      msg: "Password changed successfully",
      _data: userupdatedata,
    };
    response.send(result);
  } catch (error) {
    return response.send({
      status: false,
      msg: "Failed to authenticate token !",
      _data: [],
    });
  }
};

exports.forgotPassword = async (request, response) => {
  var email = request.body.email;
  if (!email) {
    const obj = {
      status: false,
      msg: "Oops! you have not entered the email id. Please enter the email id..!",
      _data: []
    }
    return response.send(obj)
  }
  var userData = await user.findOne({
    email: email,
    deleted_at: ""
  });

  if (!userData) {
    return response.send({
      status: false,
      msg: "Email does not exists",
      _data: [],
    });
  }

  var token = jwt.sign({ userdata: userData }, process.env.secret_key, { expiresIn: "0.5h" });

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASS
    }
  })
  var mailOptions = {
    from: "YouTube Clone",
    to: userData.email,
    subject: "Reset Password Link",
    html: `
      <div className="bg-gray-500 p-5 w-full">
        <div className="bg-white p-3 rounded-md flex flex-col items-center justify-center max-w-[300px]">
          <h1 className="text-[50px] font-bold">Hi ${userData.name}!</h1>
          <p className="text-[30px] font-semibold mt-[15px]">Password Reset Link</p>
          <p className="text-[20px] mt-[10px]">You requested to reset your password. Click the link below to proceed:</p>
          <a href=${process.env.FRONTEND_URL}/reset-password?token=${token}>
            <button className="mt-[15px] px-[25px] py-3 bg-[#4CAF50] text-white">Reset Password</button>
          </a>
          <p className="mt-[15px] text-[20px] text-[#666]">This link will expire in 2 hours.</p>
          <p className="mt-5">Best regards,<br/>The YouTube Content Creator Team</p>
        </div>
      </div>
      `
  }

  try {
    await transport.sendMail(mailOptions);
    return response.send({
      status: true,
      msg: "Forgot password process initiated. Email is Sent ! Please check your email.",
      _data: [],
      token: token,
    });
  } catch (error) {

    return response.send({
      status: false,
      msg: "Failed to send email. Check server logs.",
      _data: error,
      token: null
    });
  }
};

exports.resetPassword = async (request, response) => {

  var token = request.body.headers.authorization;
  if (!token) {
    return response.send({
      status: false,
      msg: "No Token Provided. So, Token is required",
      _data: [],
    });
  }
  try {
    token = token.split(" ")[1]; // Bearer <token> format in header is splitted to get only token part

    let decoded = jwt.verify(token, process.env.secret_key);

    let userdataid = decoded.userdata._id;

    let userData = await user.findOne({ _id: userdataid, deleted_at: null });
    console.log(userData)
    if (!userData) {
      return response.send({
        status: false,
        msg: "User not found",
        _data: [],
      });
    }

    let newPassword = request.body.new_password;
    let confirmPassword = request.body.confirm_password;
    if (!newPassword || !confirmPassword) {
      return response.send({
        status: false,
        msg: "new_password and confirm_password are required",
        _data: [],
      });
    }
    if (newPassword != confirmPassword) {
      return response.send({
        status: false,
        msg: "New password and Confirm password must be same",
        _data: [],
      });
    }
    let Changedpassword = await bcrypt.hash(newPassword, 10);
    let userupdatedata = await user.updateOne(
      {
        _id: userdataid,
      },
      {
        $set: { password: Changedpassword },
      }
    );
    const result = {
      _status: true,
      msg: "Password reset successfully",
      _data: userupdatedata,
    };
    response.send(result);
  } catch (error) {
    return response.send({
      status: false,
      msg: "Failed to authenticate token or Token may be expired!",
      _data: error,
    });
  }
};

exports.incrementpoints = async (request, response) => {
  try {
    const id = request.params.id || request.query.id
    if (!id) {
      const obj = {
        status: false,
        msg: "No any user id found..!",
        _data: null
      }
      return response.send(obj)
    }

    const userdata = await user.findByIdAndUpdate(
      {
        _id: id
      }, {
      $inc: { increment_points: 5 }
    }
    )
    if (!userdata) {
      const obj = {
        status: false,
        msg: "No any user found..!",
        _data: null
      }
      response.send(obj)
    }
    const obj = {
      status: true,
      msg: "Points Incremented by 5",
      _data: userdata
    }
    response.send(obj)
  } catch (error) {
    console.log(error)
  }
}

exports.subscribe = async (request, response) => {
  try {
    // ID of the user whom have to subscribe
    let subscriberUserId = request.params.id || request.query.id
    // IDs of channel who are subscribing to the channel
    let channelIdsToSubscribe = request.body.channel_ids

    if (!subscriberUserId) {
      return response.send({
        status: false,
        msg: "No subscriber user id found..!",
        _data: null
      })
    }

    if (!channelIdsToSubscribe) {
      return response.send({
        status: false,
        msg: "No channel id provided to subscribe..!",
        _data: null
      })
    }

    // Check if subscriber already subscribed
    const subscriberUser = await user.findById(subscriberUserId)
    if (!subscriberUser) {
      return response.send({
        status: false,
        msg: "Subscriber user not found..!",
        _data: null
      })
    }

    const channelidsSubscriberUser = await user.findById(channelIdsToSubscribe)
    if (!channelidsSubscriberUser) {
      return response.send({
        status: false,
        msg: "There are no any channels found who subscribing to...!",
        _data: null
      })
    }

    if (subscriberUser.subscribed_channels.includes(channelIdsToSubscribe)) {
      return response.send({
        status: false,
        msg: "You are already subscribed to this channel..!",
        _data: null
      })
    }

    // Add channel to user's subscribed_channels using $addToSet (prevents duplicates)
    const updatedSubscriber = await user.findByIdAndUpdate(
      {
        _id: subscriberUserId
      },
      {
        $addToSet: { subscribed_channels: channelIdsToSubscribe }
      },
      {
        new: true
      }
    ).populate('subscribed_channels')

    // Increment subscriber count of the channel
    const channelOwner = await user.findByIdAndUpdate(
      {
        _id: subscriberUserId
      },
      {
        $inc: { subscribers_count: 1 }
      }
    )

    // Send response to email of the channel owner about new subscriber
    const channelOwnerEmail = channelOwner.email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS
      }
    });
    const mailOptions = {
      from: 'YouTube Clone',
      to: channelOwnerEmail,
      subject: 'New Subscriber',
      html: `
        <div style="background-color: #f9f9f9; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; font-size: 24px;">Hi ${channelOwner.name}!</h1>
          <p style="color: #666; font-size: 18px;">
            You have a new subscriber on your channel! <br/>
            Subscriber Name: ${subscriberUser.name} <br/>
            Subscriber Email: ${subscriberUser.email} <br/>
          </p>
          <p style="color: #666; font-size: 18px;">
            Thank you for being a part of our YouTube Clone community! <br/>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return response.send({
          status: false,
          msg: "Channel subscribed successfully, but failed to send email notification.",
          _data: null
        })
      } else {
        return response.send({
          status: true,
          msg: "Channel subscribed successfully, and email notification sent.",
          _data: null
        })
      }
    });


    const obj = {
      status: true,
      msg: "Channel subscribed successfully..!",
      _data: updatedSubscriber,
    }
    response.send(obj)
  } catch (error) {
    response.send({
      status: false,
      msg: "Error subscribing to channel",
      _data: error
    })
  }
}

exports.desubscribe = async (request, response) => {
  try {
    let channelIdWhomToDesubscribe = request.params.id || request.query.id
    let ChannelIDsWhoSubscribing = request.body.channel_ids
    if (!channelIdWhomToDesubscribe) {
      const obj = {
        status: false,
        msg: "Not passing the channel id whom to subscribe...!",
        _data: ''
      }
      return response.send(obj)
    }
    if (!ChannelIDsWhoSubscribing) {
      const obj = {
        status: false,
        msg: "Not passing the channel_ids who are subscribing...!",
        _data: ''
      }
      return response.send(obj)
    }
    let channelUser = await user.findById(channelIdWhomToDesubscribe)
    let channelUsers = await user.findById(ChannelIDsWhoSubscribing)
    if (!channelUser) {
      const obj = {
        status: false,
        msg: "Not available this Channel User...!"
      }
      return response.send(obj)
    }
    if (!channelUsers) {
      const obj = {
        status: false,
        msg: "Not available These channel Users...!",
        _data: []
      }
      return response.send(obj)
    }

    if (!channelUser.subscribed_channels.includes(ChannelIDsWhoSubscribing)) {
      const obj = {
        status: false,
        msg: "You are not subscribed to this channel...!",
        _data: ''
      }
      return response.send(obj)
    }

    let updatedChannelUser = await user.findByIdAndUpdate(
      {
        _id: channelIdWhomToDesubscribe
      },
      {
        $inc: { subscribers_count: -1 },
        $pull: {
          subscribed_channels: ChannelIDsWhoSubscribing
        }
      }
    ).populate('subscribed_channels')
    const obj = {
      status: true,
      msg: "Channel desubscribed successfully..!",
      _data: updatedChannelUser
    }
    response.send(obj)
  } catch (error) {
    const obj = {
      status: false,
      msg: "Something went wrong...!",
      _data: error
    }
    return response.send(obj)
  }
}

exports.viewprofileById = async (request, response) => {
  try {
    let viewprofilebyid=request.params.id || request.query.id
    if(!viewprofilebyid){
      const obj={
        status:false,
        msg:"Not passing this user id...!",
        _data:''
      }
      return response.send(obj)
    }
    let userfindbyId=await user.findById(viewprofilebyid).populate('videoIds').populate('subscribed_channels').populate('playlist')
    if(!userfindbyId){
      const obj={
        status:false,
        msg:"Not available this user...!",
        _data:''
      }
      return response.send(obj)
    }
    const obj={
      status:true,
      msg:"User Found...!",
      _data:userfindbyId,
      imagepath:"http://localhost:5000/uploads/users/"
    }
    return response.send(obj)
  } catch (error) {
    const obj={
      status:false,
      msg:"Something went wrong...!",
      _data:error
    }
    return response.send(obj)
  }
}

// // Check if user has a free download left for today
// exports.hasFreeDownloadToday = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       console.log('hasFreeDownloadToday: email is missing');
//       return res.send({
//         message: 'email is required.',
//         free: false,
//         isPremium: false
//       })
//     }

//     console.log('hasFreeDownloadToday: checking for email:', email);

//     const user = await user.findOne({ email });
//     if (!user) {
//       console.log('hasFreeDownloadToday: user not found, creating new user');
//       await user.save();
//       return res.send({
//         free: true,
//         isPremium: false,
//         message: 'New user created with free download'
//       })
//     }

//     console.log('hasFreeDownloadToday: found user, checking premium status');

//     // Check if premium has expired
//     if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
//       console.log('hasFreeDownloadToday: premium expired, updating user');
//       user.isPremium = false;
//       user.premiumExpiry = null;
//       await user.save();
//     }

//     // Premium users get unlimited downloads
//     if (user.isPremium) {
//       console.log('hasFreeDownloadToday: user is premium, allowing download');
//       res.send({
//         free: true,
//         isPremium: true,
//         message: 'Premium user - unlimited downloads'
//       })
//     }
//     console.log('hasFreeDownloadToday: user is not premium, checking daily downloads');
//     // Free users get 1 download per day
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Ensure downloads array exists
//     if (!user.downloads) {
//       user.downloads = [];
//     }

//     const downloadsToday = user.downloads.filter(d => {
//       console.log(d)
//       if (!d.date) return false;
//       const dDate = new Date(d.date);
//       dDate.setHours(0, 0, 0, 0);
//       return dDate.getTime() === today.getTime();
//     });

//     const hasFreeDownload = downloadsToday.length < 1;
//     console.log('hasFreeDownloadToday: downloads today:', downloadsToday.length, 'hasFreeDownload:', hasFreeDownload);

//     res.send({
//       free: hasFreeDownload,
//       isPremium: false,
//       downloadsToday: downloadsToday.length,
//       message: hasFreeDownload ? 'Free download available' : 'No free downloads left today'
//     })

//   } catch (err) {
//     console.error('hasFreeDownloadToday error:', err);
//     res.send({
//       message: 'Server error',
//       error: err.message,
//       free: false,
//       isPremium: false
//     });
//   }
// };


// // Activate premium plan for a user
// exports.activatePremium = async (req, res) => {
//   try {
//     const { email, duration = 30 } = req.body; // duration in days, default 30 days
//     if (!email) return res.send({ message: 'email is required.' });

//     const user = await user.findOne({ email });
//     if (!user) return res.send({ message: 'user not found.' });

//     // Set premium status and expiry date
//     user.isPremium = true;
//     user.premiumExpiry = new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // Add days to current date
//     await user.save();

//     res.send({
//       message: 'Premium plan activated successfully',
//       isPremium: user.isPremium,
//       premiumExpiry: user.premiumExpiry
//     });
//   } catch (err) {
//     res.send({ message: 'Server error', error: err.message });
//   }
// };

// // Check premium status
// exports.checkPremiumStatus = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.send({ message: 'email is required.' });

//     const user = await user.findOne({ email });
//     if (!user) return res.send({ message: 'user not found.' });

//     // Check if premium has expired
//     if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
//       user.isPremium = false;
//       user.premiumExpiry = null;
//       await user.save();
//     }

//     res.send({
//       isPremium: user.isPremium,
//       premiumExpiry: user.premiumExpiry
//     });
//   } catch (err) {
//     res.send({ message: 'Server error', error: err.message });
//   }
// };