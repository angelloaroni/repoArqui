import Usuario from "../models/Usuario.js";

async function saveUsers(users) {

    return await Usuario.bulkCreate(users);

}

async function getAllUsers() {

    return await Usuario.findAll({

        order: [

            ["id_user", "ASC"]

        ]

    });

}

async function getUserById(id) {

    return await Usuario.findByPk(id);

}

async function getUsersCount() {

    return await Usuario.count();

}

async function deleteAllUsers() {

    return await Usuario.destroy({

        where: {},

        truncate: true,

        restartIdentity: true

    });

}

export default {

    saveUsers,

    getAllUsers,

    getUserById,

    getUsersCount,

    deleteAllUsers

};