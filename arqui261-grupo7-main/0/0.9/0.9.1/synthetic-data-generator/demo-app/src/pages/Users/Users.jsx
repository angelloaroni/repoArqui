import "./Users.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import SearchBar from "../../components/SearchBar/SearchBar";
import UserTable from "../../components/UserTable/UserTable";

function Users() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    useEffect(() => {

        loadUsers();

    }, []);

    async function loadUsers() {

        try {

            const { data } = await api.get("/users");

            setUsers(data);

        }

        catch (error) {

            console.error(error);

        }

    }

    const filteredUsers = users.filter(user =>

        `${user.name} ${user.lastname}`
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    function viewProfile(user) {

        navigate(`/profile/${user.id_user}`);

    }

    return (

        <>

            <Navbar />

            <div className="users-page">

                <Sidebar />

                <main>

                    <h1>

                        Users

                    </h1>

                    <SearchBar

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                    />

                    <UserTable

                        users={filteredUsers}

                        onView={viewProfile}

                    />

                </main>

            </div>

        </>

    );

}

export default Users;