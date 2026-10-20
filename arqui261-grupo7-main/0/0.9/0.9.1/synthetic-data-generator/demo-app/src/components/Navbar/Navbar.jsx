import "./Navbar.css";

import { useNavigate } from "react-router-dom";

function Navbar(){

    const navigate=useNavigate();

    function logout(){

        localStorage.removeItem("demo-auth");

        navigate("/");

    }

    return(

        <header className="navbar">

            <h2>

                DriveShare Demo Environment

            </h2>

            <div>

                <span>

                    Administrator

                </span>

                <button

                    className="logout-btn"

                    onClick={logout}

                >

                    Logout

                </button>

            </div>

        </header>

    );

}

export default Navbar;