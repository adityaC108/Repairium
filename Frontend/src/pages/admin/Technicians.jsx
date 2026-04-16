import React, { useEffect, useState } from "react";
import {
  getAllTechnicians,
  updateTechnicianStatus,
  verifyTechnician,
} from "../../services/adminService";

const Technicians = () => {
  const [techs, setTechs] = useState([]);

  const fetchTechs = async () => {
    try {
      const res = await getAllTechnicians();
      setTechs(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const handleVerify = async (id, status) => {
    await verifyTechnician(id, { verificationStatus: status });
    fetchTechs();
  };

  const handleToggle = async (id, isActive) => {
    await updateTechnicianStatus(id, { isActive: !isActive });
    fetchTechs();
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Technicians</h1>

      <table className="w-full bg-gray-800 rounded-xl">
        <thead>
          <tr className="bg-gray-700">
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Verification</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {techs?.map((t) => (
            <tr key={t._id} className="text-center border-t border-gray-700">
              <td>
                {t.firstName} {t.lastName}
              </td>
              <td>{t.email}</td>
              <td>{t.isActive ? "Active" : "Blocked"}</td>
              <td>{t.verificationStatus}</td>
              <td className="flex gap-2 justify-center py-2">
                <button
                  onClick={() => handleVerify(t._id, "verified")}
                  className="bg-green-500 px-2 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleVerify(t._id, "rejected")}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleToggle(t._id, t.isActive)}
                  className="bg-blue-500 px-2 py-1 rounded"
                >
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Technicians;
