import "./Sidebar.css";

import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <aside className="sidebar">

            <h2>

                Demo

            </h2>

            <nav>

                <Link to="/dashboard">

                    📊 Dashboard

                </Link>

                <Link to="/users">

                    👥 Users

                </Link>

            </nav>

        </aside>

    );

}

export default Sidebar;