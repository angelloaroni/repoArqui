import "./Profile.css";

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../../services/api";

import Navbar from "../../components/Navbar/Navbar";

import Sidebar from "../../components/Sidebar/Sidebar";

function Profile(){

    const { id } = useParams();

    const [user,setUser]=useState(null);

    useEffect(()=>{

        loadUser();

    },[]);

    async function loadUser(){

        try{

            const {data}=await api.get(`/users/${id}`);

            setUser(data);

        }

        catch(error){

            console.error(error);

        }

    }

    if(!user){

        return(

            <>

                <Navbar/>

                <div className="profile-page">

                    <Sidebar/>

                    <main>

                        Loading...

                    </main>

                </div>

            </>

        );

    }

    return(

        <>

            <Navbar/>

            <div className="profile-page">

                <Sidebar/>

                <main>

                    <div className="profile-card">

                        <div className="avatar">

                            {user.name.charAt(0)}

                        </div>

                        <h2>

                            {user.name} {user.lastname}

                        </h2>

                        <p>{user.email}</p>

                        <hr/>

                        <p>

                            <strong>Phone:</strong> {user.phone || "-"}

                        </p>

                        <p>

                            <strong>Provider:</strong> {user.provider}

                        </p>

                        <p>

                            <strong>Role:</strong> {user.role}

                        </p>

                        <p>

                            <strong>Status:</strong> {user.status}

                        </p>

                        <p>

                            <strong>Nationality:</strong> {user.nationality || "-"}

                        </p>

                        <p>

                            <strong>Document:</strong> {user.document_id || "-"}

                        </p>

                        <p>

                            <strong>Driver License:</strong> {user.driver_license || "-"}

                        </p>

                    </div>

                </main>

            </div>

        </>

    );

}

export default Profile;