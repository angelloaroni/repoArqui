//Segundo Tema Individual\driveshare-sidecar-demo\user-service\controllers\user.controller.js
import userService from "../services/user.service.js";

class UserController {

  async createUser(req, res) {

    try {

      const user = await userService.createUser(
        req.body
      );

      return res.status(201).json(user);

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: error.message
      });

    }
  }

  async getUser(req, res) {

    try {

      const user =
        await userService.getUserById(
          req.params.id
        );

      if (!user) {

        return res.status(404).json({
          message: "User not found"
        });

      }

      return res.json(user);

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: error.message
      });

    }
  }

  async changeRole(req, res) {

    try {

      const { role } = req.body;

      const user =
        await userService.changeRole(
          req.params.id,
          role
        );

      return res.json(user);

    } catch (error) {

      console.error(error);

      if (error.message === "Invalid role") {

        return res.status(400).json({
          message: error.message
        });

      }

      if (error.message === "User not found") {

        return res.status(404).json({
          message: error.message
        });

      }

      return res.status(500).json({
        message: error.message
      });

    }
  }

}

export default new UserController();