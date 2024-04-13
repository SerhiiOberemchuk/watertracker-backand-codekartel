import User from "../models/User.js";
import gravatarUrl from "gravatar-url";

export const generateAvatar = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    let initials;
    if (user.name) {
      initials = user.name[0];
    } else {
      initials = user.email[0];
    }

    const avatar = gravatarUrl(user.email, {
      size: 100,
      default: "identicon",
    });

    return {
      avatar,
      initials,
    };
  } catch (error) {
    console.log(error.message);
  }
};
