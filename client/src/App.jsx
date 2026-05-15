import { useState, useEffect } from "react";
import axios from "axios";

import "react-calendar-heatmap/dist/styles.css";
import CalendarHeatmap from "react-calendar-heatmap";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

function App() {

  // =========================
  // USER
  // =========================
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // =========================
  // DARK MODE
  // =========================
  const [darkMode, setDarkMode] = useState(false);

  // =========================
  // LOGIN DATA
  // =========================
  const [loginData, setLoginData] = useState({
    name: "",
    password: "",
  });

  // =========================
  // STUDY FORM
  // =========================
  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    subject: "",
  });

  // =========================
  // STUDY DATA
  // =========================
  const [studyData, setStudyData] = useState([]);

  // =========================
  // EDIT ID
  // =========================
  const [editId, setEditId] = useState(null);

  // =========================
  // LOGIN INPUT
  // =========================
  const handleLoginChange = (e) => {

    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // STUDY INPUT
  // =========================
  const handleStudyChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:5000/auth/login",
        loginData
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      setCurrentUser(res.data);

      alert("Login Successful");

    } catch (err) {

      console.log(err);

      alert("Wrong Credentials");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {

    localStorage.removeItem("user");

    setCurrentUser(null);
  };

  // =========================
  // FETCH STUDY DATA
  // =========================
  const fetchStudyData = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/study"
      );

      setStudyData(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    fetchStudyData();

  }, []);

  // =========================
  // ADD / UPDATE STUDY
  // =========================
  const handleStudySubmit = async (e) => {

    e.preventDefault();

    try {

      const studyEntry = {

        name: currentUser?.name,

        date: formData.date,

        hours: Number(formData.hours),

        subject: formData.subject,
      };

      // UPDATE
      if (editId) {

        await axios.put(
          `http://localhost:5000/study/${editId}`,
          studyEntry
        );

        alert("Study Updated");

        setEditId(null);

      } else {

        // ADD
        await axios.post(
          "http://localhost:5000/study/add",
          studyEntry
        );

        alert("Study Added");
      }

      fetchStudyData();

      setFormData({
        date: "",
        hours: "",
        subject: "",
      });

    } catch (err) {

      console.log(err);

      alert("Error");
    }
  };

  // =========================
  // EDIT
  // =========================
  const editStudy = (item) => {

    if (item.name !== currentUser?.name) {

      alert("You can edit only your data");

      return;
    }

    setFormData({
      date: item.date,
      hours: item.hours,
      subject: item.subject,
    });

    setEditId(item._id);
  };

  // =========================
  // DELETE
  // =========================
  const deleteStudy = async (id, itemName) => {

    if (itemName !== currentUser?.name) {

      alert("You can delete only your data");

      return;
    }

    try {

      await axios.delete(
        `http://localhost:5000/study/${id}`
      );

      fetchStudyData();

      alert("Deleted Successfully");

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // TOTAL HOURS
  // =========================
  const totalHours = studyData.reduce(
    (total, item) =>
      total + Number(item.hours),
    0
  );

  // =========================
  // LEADERBOARD
  // =========================
  const userTotals = {};

  studyData.forEach((item) => {

    if (userTotals[item.name]) {

      userTotals[item.name] +=
        Number(item.hours);

    } else {

      userTotals[item.name] =
        Number(item.hours);
    }
  });

  const leaderboard =
    Object.entries(userTotals).sort(
      (a, b) => b[1] - a[1]
    );

  const topUser =
    leaderboard.length > 0
      ? leaderboard[0][0]
      : "No Data";

  // =========================
  // GRAPH DATA
  // =========================
  const groupedData = {};

  studyData.forEach((item) => {

    if (!groupedData[item.date]) {

      groupedData[item.date] = {
        date: item.date,
      };
    }

    groupedData[item.date][item.name] =
      Number(item.hours);
  });

  const chartData =
    Object.values(groupedData).sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

  // =========================
  // HEATMAP DATA
  // =========================
  const heatmapData = studyData.map(
    (item) => ({
      date: item.date,
      count: Number(item.hours),
    })
  );

  // =========================
  // STREAK
  // =========================
  const userEntries =
    studyData.filter(
      (item) =>
        item.name === currentUser?.name
    );

  const dates =
    userEntries.map((item) => item.date);

  const uniqueDates =
    [...new Set(dates)].sort();

  let streak = 0;

  if (uniqueDates.length > 0) {

    streak = 1;

    for (
      let i = uniqueDates.length - 1;
      i > 0;
      i--
    ) {

      const currentDate =
        new Date(uniqueDates[i]);

      const previousDate =
        new Date(uniqueDates[i - 1]);

      const diffTime =
        currentDate - previousDate;

      const diffDays =
        diffTime /
        (1000 * 60 * 60 * 24);

      if (diffDays === 1) {

        streak++;

      } else {

        break;
      }
    }
  }

  // =========================
  // DAILY MESSAGE
  // =========================
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todayEntries =
    studyData.filter(
      (item) =>
        item.name === currentUser?.name &&
        item.date === today
    );

  const todayHours =
    todayEntries.reduce(
      (total, item) =>
        total + Number(item.hours),
      0
    );

  let studyMessage = "";
  let messageColor = "";

  if (todayHours >= 5) {

    studyMessage = `
🌟 Amazing work ${currentUser?.name}!

Every hour you study today is building your future.

Your consistency and discipline will make you successful ❤️
`;

    messageColor =
      "from-green-500 to-emerald-600";

  } else {

    studyMessage = `
💔 ${currentUser?.name}, you studied below your daily target today.

Small efforts every day create big success stories.

Don't give up — tomorrow is another chance ❤️
`;

    messageColor =
      "from-red-500 to-pink-600";
  }

  // =========================
  // LOGIN PAGE
  // =========================
  if (!currentUser) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#dbeafe] to-[#ede9fe] flex items-center justify-center">

        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-[420px]">

          <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-8">
            Study Battle
          </h1>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={loginData.name}
              onChange={handleLoginChange}
              className="w-full p-4 rounded-2xl border border-gray-200 outline-none"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full p-4 rounded-2xl border border-gray-200 outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white py-4 rounded-2xl text-lg font-bold"
            >
              Login
            </button>

          </form>

        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================
  return (

    <div
      className={`min-h-screen p-6 transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] text-white"
          : "bg-gradient-to-br from-[#eef2ff] via-[#dbeafe] to-[#ede9fe] text-gray-900"
      }`}
    >

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Study Battle
          </h1>

          <p className="mt-3 text-xl">
            Welcome, {currentUser?.name} 👋
          </p>

        </div>

        <div className="flex gap-4">

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white px-6 py-3 rounded-2xl"
          >
            {darkMode
              ? "☀️ Light"
              : "🌙 Dark"}
          </button>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-3 rounded-2xl"
          >
            Logout
          </button>

        </div>

      </div>

      {/* DAILY MESSAGE */}
      <div className={`bg-gradient-to-r ${messageColor} text-white p-8 rounded-3xl shadow-2xl mb-10 text-center`}>

        <h2 className="text-4xl font-bold mb-5">
          Daily Motivation ✨
        </h2>

        <p className="text-2xl leading-10 whitespace-pre-line">
          {studyMessage}
        </p>

        <div className="mt-6 text-2xl font-bold">
          📚 Today's Study Hours:
          <span className="ml-2">
            {todayHours} hrs
          </span>
        </div>

      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className={`p-6 rounded-3xl shadow-2xl ${
          darkMode
            ? "bg-white/10 backdrop-blur-lg border border-white/10"
            : "bg-white/70 backdrop-blur-lg"
        }`}>
          <h2 className="text-xl font-semibold">
            Total Sessions
          </h2>

          <p className="text-5xl font-bold mt-4 text-blue-500">
            {studyData.length}
          </p>
        </div>

        <div className={`p-6 rounded-3xl shadow-2xl ${
          darkMode
            ? "bg-white/10 backdrop-blur-lg border border-white/10"
            : "bg-white/70 backdrop-blur-lg"
        }`}>
          <h2 className="text-xl font-semibold">
            Total Hours
          </h2>

          <p className="text-5xl font-bold mt-4 text-purple-500">
            {totalHours}
          </p>
        </div>

        <div className={`p-6 rounded-3xl shadow-2xl ${
          darkMode
            ? "bg-white/10 backdrop-blur-lg border border-white/10"
            : "bg-white/70 backdrop-blur-lg"
        }`}>
          <h2 className="text-xl font-semibold">
            Top Competitor
          </h2>

          <p className="text-3xl font-bold mt-4 text-pink-500">
            👑 {topUser}
          </p>
        </div>

        <div className={`p-6 rounded-3xl shadow-2xl ${
          darkMode
            ? "bg-white/10 backdrop-blur-lg border border-white/10"
            : "bg-white/70 backdrop-blur-lg"
        }`}>
          <h2 className="text-xl font-semibold">
            Current Streak
          </h2>

          <p className="text-4xl font-bold mt-4 text-orange-500">
            🔥 {streak} Days
          </p>
        </div>

      </div>

      {/* LEADERBOARD */}
      <div className={`p-6 rounded-3xl shadow-2xl mb-10 ${
        darkMode
          ? "bg-white/10 backdrop-blur-lg border border-white/10"
          : "bg-white/70 backdrop-blur-lg"
      }`}>

        <h2 className="text-3xl font-bold mb-6">
          Leaderboard 🏆
        </h2>

        <div className="space-y-4">

          {leaderboard.map((user, index) => (

            <div
              key={index}
              className={`flex justify-between items-center p-5 rounded-2xl ${
                darkMode
                  ? "bg-slate-800"
                  : "bg-gradient-to-r from-blue-50 to-violet-50"
              }`}
            >

              <div className="flex items-center gap-4">

                <span className="text-3xl font-bold">
                  #{index + 1}
                </span>

                <h3 className="text-2xl font-bold">
                  {user[0]}
                </h3>

              </div>

              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-full font-bold">
                {user[1]} hrs
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* GRAPH */}
      <div className={`p-6 rounded-3xl shadow-2xl mb-10 ${
        darkMode
          ? "bg-white/10 backdrop-blur-lg border border-white/10"
          : "bg-white/70 backdrop-blur-lg"
      }`}>

        <h2 className="text-3xl font-bold mb-6">
          Competition Analytics 📈
        </h2>

        <div className="w-full h-[450px]">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              {leaderboard.map((user, index) => {

                const colors = [
                  "#3B82F6",
                  "#EF4444",
                ];

                return (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={user[0]}
                    stroke={colors[index]}
                    strokeWidth={4}
                    dot={{ r: 6 }}
                    connectNulls={true}
                  />
                );
              })}

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* HEATMAP */}
      <div className={`p-6 rounded-3xl shadow-2xl mb-10 overflow-x-auto ${
        darkMode
          ? "bg-white/10 backdrop-blur-lg border border-white/10"
          : "bg-white/70 backdrop-blur-lg"
      }`}>

        <h2 className="text-3xl font-bold mb-6">
          Study Consistency 🗓️
        </h2>

        <div className="scale-75 origin-left">

          <CalendarHeatmap
            startDate={new Date("2026-01-01")}
            endDate={new Date()}
            values={heatmapData}
            gutterSize={4}
            showWeekdayLabels={false}

            classForValue={(value) => {

              if (!value || value.count === 0) {
                return "color-empty";
              }

              if (value.count >= 8) {
                return "color-github-4";
              }

              if (value.count >= 5) {
                return "color-github-3";
              }

              if (value.count >= 3) {
                return "color-github-2";
              }

              return "color-github-1";
            }}
          />

        </div>

      </div>

      {/* FORM + RECORDS */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* FORM */}
        <div className={`p-6 rounded-3xl shadow-2xl ${
          darkMode
            ? "bg-white/10 backdrop-blur-lg border border-white/10"
            : "bg-white/70 backdrop-blur-lg"
        }`}>

          <h2 className="text-3xl font-bold mb-6">
            Add Study Entry
          </h2>

          <form
            onSubmit={handleStudySubmit}
            className="space-y-5"
          >

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleStudyChange}
              className={`w-full p-4 rounded-2xl outline-none ${
                darkMode
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white border border-gray-200"
              }`}
              required
            />

            <input
              type="number"
              name="hours"
              placeholder="Study Hours"
              value={formData.hours}
              onChange={handleStudyChange}
              className={`w-full p-4 rounded-2xl outline-none ${
                darkMode
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white border border-gray-200"
              }`}
              required
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleStudyChange}
              className={`w-full p-4 rounded-2xl outline-none ${
                darkMode
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white border border-gray-200"
              }`}
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white py-4 rounded-2xl text-lg font-bold"
            >
              {editId
                ? "Update Study Data"
                : "Add Study Data"}
            </button>

          </form>

        </div>

        {/* RECORDS */}
        <div className={`p-6 rounded-3xl shadow-2xl ${
          darkMode
            ? "bg-white/10 backdrop-blur-lg border border-white/10"
            : "bg-white/70 backdrop-blur-lg"
        }`}>

          <h2 className="text-3xl font-bold mb-6">
            Study Records
          </h2>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">

            {studyData.map((item) => (

              <div
                key={item._id}
                className={`p-5 rounded-2xl shadow-lg ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-gradient-to-r from-blue-50 to-violet-50"
                }`}
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h3 className="text-2xl font-bold">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-lg">
                      📚 {item.subject}
                    </p>

                    <p className="text-lg">
                      📅 {
                        new Date(item.date)
                          .toLocaleDateString("en-GB")
                          .replaceAll("/", "-")
                      }
                    </p>

                  </div>

                  <div className="flex gap-3 items-start">

                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold">
                      {item.hours} hrs
                    </span>

                    {item.name === currentUser?.name && (
                      <button
                        onClick={() =>
                          editStudy(item)
                        }
                        className="bg-yellow-500 text-white px-4 py-2 rounded-full"
                      >
                        Edit
                      </button>
                    )}

                    {item.name === currentUser?.name && (
                      <button
                        onClick={() =>
                          deleteStudy(
                            item._id,
                            item.name
                          )
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-full"
                      >
                        Delete
                      </button>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;