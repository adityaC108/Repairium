// import React from 'react'

// const Users = () => {
//   return (
//     <div>Users</div>
//   )
// }

// export default Users

import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus } from "../../services/adminService";

const Users = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data); // pagination response
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateUserStatus(id, { isActive: !isActive });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <table className="w-full bg-gray-800 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-3">Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users?.map((u) => (
            <tr key={u._id} className="text-center border-t border-gray-700">
              <td className="p-3">
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.isActive ? "Active" : "Blocked"}</td>
              <td>
                <button
                  onClick={() => handleToggleStatus(u._id, u.isActive)}
                  className="bg-blue-500 px-3 py-1 rounded"
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;