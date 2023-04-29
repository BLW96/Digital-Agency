const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

// User Schema

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter a username"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Minimum password is 6 characters"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// fire a function befor doc saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Static method to login user
userSchema.statics.login = async function (username, password) {
  //check user if exists by username
  const user = await this.findOne({ username });
  if (user) {
    // compare the password with user password stored in db
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
};

module.exports = mongoose.model("User", userSchema);
