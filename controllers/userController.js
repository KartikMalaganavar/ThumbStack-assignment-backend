const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    await User.findByIdAndUpdate(user._id, { onlineStatus: true });

    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      onlineStatus: true,
    });
    delete user.password;

    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};


module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    const usersWithOnlineStatus = users.map((user) => {
      const onlineUser = onlineUsers.get(user._id.toString());
      return {
        ...user.toObject(),
        onlineStatus: onlineUser ? true : false,
      };
    });
    return res.json(usersWithOnlineStatus);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ msg: "User id is required" });
    }
    // await User.findByIdAndUpdate(req.params.id, { onlineStatus: false });
    onlineUsers.delete(req.params.id);
    return res.status(200).send("logged out successfully");
  } catch (ex) {
    next(ex);
  }
};
