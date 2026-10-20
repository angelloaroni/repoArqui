//Segundo Tema Individual\driveshare-sidecar-demo\user-service\services\user.service.js
import axios from "axios";

import userRepository from "../repositories/user.repository.js";

class UserService {

  async createUser(userData) {

    const user =
      await userRepository.create(userData);

    await axios.post(
      `${process.env.AUDIT_SERVICE_URL}/events`,
      {
        event: "USER_CREATED",
        user_id: user.id_user,
        email: user.email
      }
    );

    return user;

  }

  async getUserById(id) {

    const user =
      await userRepository.findById(id);

    if (user) {

      await axios.post(
        `${process.env.AUDIT_SERVICE_URL}/events`,
        {
          event: "USER_VIEWED",
          user_id: user.id_user,
          email: user.email
        }
      );

    }

    return user;

  }

  async changeRole(userId, newRole) {

    const validRoles = [
      "arrendatario",
      "arrendador"
    ];

    if (!validRoles.includes(newRole)) {

      await axios.post(
        `${process.env.AUDIT_SERVICE_URL}/events`,
        {
          event: "ROLE_CHANGE_DENIED",
          user_id: userId,
          reason: "Rol inválido"
        }
      );

      throw new Error("Invalid role");
    }

    const user =
      await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const previousRole = user.role;

    // Evita auditorías duplicadas
    if (previousRole === newRole) {
      return user;
    }

    const updatedUser =
      await userRepository.updateRole(
        userId,
        newRole
      );

    await axios.post(
      `${process.env.AUDIT_SERVICE_URL}/events`,
      {
        event: "ROLE_CHANGED",
        user_id: user.id_user,
        email: user.email,
        role_anterior: previousRole,
        role_nuevo: newRole
      }
    );

    return updatedUser;
  }

}

export default new UserService();