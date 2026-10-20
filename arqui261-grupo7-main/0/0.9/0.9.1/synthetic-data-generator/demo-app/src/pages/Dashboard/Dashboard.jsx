import "./Dashboard.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import StatsCard from "../../components/StatsCard/StatsCard";

function Dashboard() {

    const [users, setUsers] = useState([]);

    useEffect(() => {

        loadUsers();

    }, []);

    async function loadUsers() {

        try {

            const { data } = await api.get("/users");

            setUsers(data);

        } catch (error) {

            console.error(error);

        }

    }

    const totalUsers = users.length;

    const googleUsers = users.filter(
        user => user.provider === "google"
    ).length;

    const localUsers = users.filter(
        user => user.provider === "local"
    ).length;

    const arrendadores = users.filter(
        user => user.role === "arrendador"
    ).length;

    const arrendatarios = users.filter(
        user => user.role === "arrendatario"
    ).length;

    return (

        <>

            <Navbar />

            <div className="dashboard">

                <Sidebar />

                <main>

                    <h1>

                        Dashboard

                    </h1>

                    <div className="cards">

                        <StatsCard
                            title="Total Users"
                            value={totalUsers}
                        />

                        <StatsCard
                            title="Google Users"
                            value={googleUsers}
                        />

                        <StatsCard
                            title="Local Users"
                            value={localUsers}
                        />

                        <StatsCard
                            title="Arrendadores"
                            value={arrendadores}
                        />

                        <StatsCard
                            title="Arrendatarios"
                            value={arrendatarios}
                        />

                    </div>

                    <div className="dashboard-actions">

                        <Link
                            to="/users"
                            className="view-users"
                        >
                            View Generated Users
                        </Link>

                    </div>

                </main>

            </div>

        </>

    );

}

export default Dashboard;