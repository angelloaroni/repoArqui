function UsersTable({ users = [] }) {

    if (users.length === 0)
        return null;

    return (

        <>

            <h2>👥 Generated Users Preview</h2>

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Name</th>

                        <th>Lastname</th>

                        <th>Email</th>

                        <th>Provider</th>

                        <th>Role</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        users.map((user) => (

                            <tr key={user.id_user}>

                                <td>{user.id_user}</td>

                                <td>{user.name}</td>

                                <td>{user.lastname}</td>

                                <td>{user.email}</td>

                                <td>{user.provider}</td>

                                <td>{user.role}</td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </>

    );

}

export default UsersTable;