function CsvFiles({ files = [] }) {

    const download = (filename) => {

        window.open(

            `http://localhost:3200/api/users/download/${filename}`,

            "_blank"

        );

    };

    return (

        <>

            <h2>📁 Generated CSV Files</h2>

            {

                files.length === 0 && (

                    <p>No CSV files generated.</p>

                )

            }

            {

                files.map((file) => (

                    <div

                        key={file}

                        className="csv-item"

                    >

                        <span>

                            📄 {file}

                        </span>

                        <button

                            className="download-btn"

                            onClick={() => download(file)}

                        >

                            Download

                        </button>

                    </div>

                ))

            }

        </>

    );

}

export default CsvFiles;