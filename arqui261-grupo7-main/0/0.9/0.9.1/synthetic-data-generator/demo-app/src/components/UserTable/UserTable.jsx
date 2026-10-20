import "./UserTable.css";

function UserTable({ users, onView }) {

    return (

        <table className="user-table">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Email</th>

                    <th>Provider</th>

                    <th>Role</th>

                    <th></th>

                </tr>

            </thead>

            <tbody>

                {

                    users.map(user=>(

                        <tr key={user.id_user}>

                            <td>{user.id_user}</td>

                            <td>

                                {user.name} {user.lastname}

                            </td>

                            <td>{user.email}</td>

                            <td>{user.provider}</td>

                            <td>{user.role}</td>

                            <td>

                                <button

                                    className="view-btn"

                                    onClick={()=>onView(user)}

                                >

                                    View

                                </button>

                            </td>

                        </tr>

                    ))

                }

            </tbody>

        </table>

    );

}

export default UserTable;