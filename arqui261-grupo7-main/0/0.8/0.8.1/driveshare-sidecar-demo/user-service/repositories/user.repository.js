import User from "../models/user.model.js";

class UserRepository {

  async create(userData) {

    return await User.create(userData);

  }

  async findById(id) {

    return await User.findByPk(id);

  }

  async updateRole(id, role) {

    const user = await User.findByPk(id);

    if (!user) {
      return null;
    }

    await user.update({
      role
    });

    return user;
  }

}

export default new UserRepository();