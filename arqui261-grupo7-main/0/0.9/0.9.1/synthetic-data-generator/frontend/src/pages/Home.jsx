import { useEffect, useState } from "react";

import api from "../services/api";

import CsvFiles from "../components/CsvFiles";
import StatsCard from "../components/StatsCard";
import UsersTable from "../components/UsersTable";

function Home() {

    const [amount, setAmount] = useState(10);

    const [response, setResponse] = useState(null);

    const [csvFiles, setCsvFiles] = useState([]);

    const loadCsvFiles = async () => {

        try {

            const { data } = await api.get("/users/files");

            setCsvFiles(data.files);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        loadCsvFiles();

    }, []);

    const generateUsers = async () => {

        try {

            const { data } = await api.post("/users/generate", {

                amount

            });

            setResponse(data);

            loadCsvFiles();

        } catch (error) {

            console.error(error);

            alert("Error generating users.");

        }

    };

    const deleteUsers = async () => {

        try {

            await api.delete("/users");

            setResponse(null);

        } catch (error) {

            console.error(error);

        }

    };

    return (

        <div className="main-container">

            <h1>🧪 Synthetic Data Generator</h1>

            <div className="form-group">

                <label>

                    Number of Users

                </label>

                <input

                    type="number"

                    value={amount}

                    onChange={(e) => setAmount(Number(e.target.value))}

                />

            </div>

            <br />

            <button

                className="btn btn-primary"

                onClick={generateUsers}

            >

                Generate Synthetic Users

            </button>

            <br />

            <br />

            <button

                className="btn btn-danger"

                onClick={deleteUsers}

            >

                Clear Database

            </button>

            {

                response && (

                    <>

                        <div className="stats">

                            <StatsCard

                                title="Generated"

                                value={response.generated}

                            />

                            <StatsCard

                                title="Total Users"

                                value={response.totalUsers}

                            />

                            <StatsCard

                                title="Execution Time"

                                value={response.executionTime}

                            />

                        </div>

                        <div className="section">

                            <h2>📄 Latest CSV</h2>

                            <div className="csv-name">

                                {response.csvFile}

                            </div>

                        </div>

                    </>

                )

            }

            <div className="section">

                <CsvFiles files={csvFiles} />

            </div>

            {

                response && (

                    <div className="section">

                        <UsersTable

                            users={response.users}

                        />

                    </div>

                )

            }

        </div>

    );

}

export default Home;