import React from "react";
import { useSelector } from "react-redux";

const Alert = ({ message, color }) => (
  <div
    className={`text-sm font-semibold px-3 py-1 rounded shadow mb-2 ${color}`}
  >
    {message}
  </div>
);

const Status = () => {
  const { happiness, energy, hunger, isDirty, hasFleas, hasMange } =
    useSelector((s) => s.dog);

  const alerts = [];

  if (hunger < 30)
    alerts.push({
      msg: "🐶 Your dog is getting hungry!",
      color: "bg-yellow-600",
    });
  if (energy < 25)
    alerts.push({
      msg: "⚡ Low energy — try resting or feeding!",
      color: "bg-blue-600",
    });
  if (happiness < 30)
    alerts.push({ msg: "😢 Your dog feels neglected!", color: "bg-pink-600" });
  if (isDirty) alerts.push({ msg: "🧼 Needs a bath!", color: "bg-green-700" });
  if (hasFleas)
    alerts.push({ msg: "🐜 Fleas! Groom soon!", color: "bg-red-600" });
  if (hasMange)
    alerts.push({
      msg: "⚠️ Dog has mange. Needs urgent care.",
      color: "bg-red-800",
    });

  return (
    <div className="w-64 bg-white/10 backdrop-blur-sm text-white p-3 rounded shadow-md">
      <h3 className="text-lg font-bold mb-2">📋 Dog Status</h3>

      {alerts.length === 0 ? (
        <p className="text-sm text-white/70">
          All good! Your dog is doing well. 🐾
        </p>
      ) : (
        alerts.map((alert, i) => (
          <Alert key={i} message={alert.msg} color={alert.color} />
        ))
      )}
    </div>
  );
};

export default Status;
