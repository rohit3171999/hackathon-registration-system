// App.js
import React from "react";

const { useState } = React;

function App() {
    // State management for different parts of the application
    const [activeView, setActiveView] = useState('dashboard'); // ['dashboard', 'registerStudent', 'createHackathon', 'viewTeams']
    const [students, setStudents] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [currentHackathon, setCurrentHackathon] = useState(null);
    const [notification, setNotification] = useState('');

    // Form state for new student registration
    const [studentForm, setStudentForm] = useState({
        name: '', roll_number: '', course: '', year: '', batch: '', email: '', phone_number: ''
    });

    // Form state for new hackathon creation
    const [hackathonForm, setHackathonForm] = useState({
        name: '', date: '', description: '', max_teams: ''
    });

    // Function to display a notification message
    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000); // Hide after 3 seconds
    };

    // --- Core Logic Functions ---

    // 1. Handle Student Registration
    const handleStudentRegister = (e) => {
        e.preventDefault();
        const { email, roll_number } = studentForm;
        if (students.some(s => s.email === email || s.roll_number === roll_number)) {
            showNotification('❌ Error: Student with this email or roll number already exists.');
            return;
        }
        const newStudent = { ...studentForm, id: `S${Date.now()}` };
        setStudents([...students, newStudent]);
        showNotification(`✅ Student "${newStudent.name}" registered successfully!`);
        setStudentForm({ name: '', roll_number: '', course: '', year: '', batch: '', email: '', phone_number: '' });
        setActiveView('dashboard');
    };

    // 2. Handle Hackathon Creation
    const handleHackathonCreate = (e) => {
        e.preventDefault();
        const newHackathon = {
            ...hackathonForm,
            hackathon_id: `H${Date.now()}`,
            registered_students: [],
            teams: []
        };
        setHackathons([...hackathons, newHackathon]);
        showNotification(`🚀 Hackathon "${newHackathon.name}" created!`);
        setHackathonForm({ name: '', date: '', description: '', max_teams: '' });
        setActiveView('dashboard');
    };

    // 3. Register a student for a hackathon
    const handleHackathonRegistration = (hackathonId) => {
        if (students.length === 0) {
            showNotification('⚠️ Please register a student first.');
            return;
        }
        // For simplicity, we register the latest student
        const studentToRegister = students[students.length - 1];

        const updatedHackathons = hackathons.map(h => {
            if (h.hackathon_id === hackathonId) {
                if (h.registered_students.some(s => s.id === studentToRegister.id)) {
                    showNotification(`🤔 Student "${studentToRegister.name}" is already registered for this hackathon.`);
                    return h;
                }
                const registered_students = [...h.registered_students, studentToRegister];
                showNotification(`👍 "${studentToRegister.name}" registered for "${h.name}".`);
                return { ...h, registered_students };
            }
            return h;
        });
        setHackathons(updatedHackathons);
    };

    // 4. Generate teams for a hackathon
    const handleGenerateTeams = (hackathonId) => {
        const hackathon = hackathons.find(h => h.hackathon_id === hackathonId);
        if (!hackathon || hackathon.registered_students.length === 0) {
            showNotification('🤷 No registered students to form teams.');
            return;
        }

        // Fisher-Yates shuffle algorithm to randomize students
        let shuffledStudents = [...hackathon.registered_students];
        for (let i = shuffledStudents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
        }

        const newTeams = [];
        let teamCounter = 1;
        while (shuffledStudents.length > 0) {
            const teamMembers = shuffledStudents.splice(0, 4);
            newTeams.push({
                team_id: `T${hackathonId.slice(1)}-${teamCounter++}`,
                hackathon_id: hackathonId,
                members: teamMembers.map(s => ({ id: s.id, name: s.name, email: s.email }))
            });
        }

        const updatedHackathons = hackathons.map(h =>
            h.hackathon_id === hackathonId ? { ...h, teams: newTeams } : h
        );

        setHackathons(updatedHackathons);
        setCurrentHackathon(updatedHackathons.find(h => h.hackathon_id === hackathonId));
        setActiveView('viewTeams');
        showNotification(`🎉 Teams generated for "${hackathon.name}"!`);
    };

    // --- UI Rendering ---

    const renderNav = () => (
        <nav className="bg-white shadow-md mb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <div className="text-2xl font-bold text-indigo-600">
                        Code<span className="text-gray-800">Reg</span> 📝
                    </div>
                    <div className="flex space-x-6 text-gray-500">
                        {['dashboard', 'registerStudent', 'createHackathon'].map(view => (
                            <button
                                key={view}
                                onClick={() => setActiveView(view)}
                                className={`px-3 py-2 border-b-2 transition ${activeView === view ? 'nav-active' : 'border-transparent hover:text-indigo-600'}`}>
                                {view.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );

    const renderNotification = () => notification && (
        <div className="fixed top-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg" role="alert">
            <span className="block sm:inline">{notification}</span>
        </div>
    );

    const renderDashboard = () => (
        <div>
            <h2 className="text-3xl font-bold mb-6">Hackathon Dashboard 🚀</h2>
            {hackathons.length === 0 ? (
                <p>No hackathons created yet. Go to "Create Hackathon" to add one!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathons.map(h => (
                        <div key={h.hackathon_id} className="card flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-indigo-700">{h.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{new Date(h.date).toDateString()}</p>
                                <p className="text-gray-700 mb-4">{h.description}</p>
                                <p className="text-sm font-medium">Registered: <span className="font-bold">{h.registered_students.length}</span></p>
                                <p className="text-sm font-medium">Teams Generated: <span className="font-bold">{h.teams.length > 0 ? 'Yes' : 'No'}</span></p>
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <button onClick={() => handleHackathonRegistration(h.hackathon_id)} className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition">Register Last Student</button>
                                <button onClick={() => handleGenerateTeams(h.hackathon_id)} className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 transition">Generate Teams</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStudentForm = () => (
        <div className="card max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Register as a Student 👨‍🎓</h2>
            <form onSubmit={handleStudentRegister} className="space-y-4">
                <input type="text" placeholder="Full Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Roll Number" value={studentForm.roll_number} onChange={e => setStudentForm({...studentForm, roll_number: e.target.value})} className="w-full p-2 border rounded" required />
                <input type="email" placeholder="Email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className="w-full p-2 border rounded" required />
                <input type="tel" placeholder="Phone Number" value={studentForm.phone_number} onChange={e => setStudentForm({...studentForm, phone_number: e.target.value})} className="w-full p-2 border rounded" required />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Course (e.g., B.Tech)" value={studentForm.course} onChange={e => setStudentForm({...studentForm, course: e.target.value})} className="w-full p-2 border rounded" />
                    <input type="text" placeholder="Year (e.g., 3rd)" value={studentForm.year} onChange={e => setStudentForm({...studentForm, year: e.target.value})} className="w-full p-2 border rounded" />
                    <input type="text" placeholder="Batch (e.g., 2022-26)" value={studentForm.batch} onChange={e => setStudentForm({...studentForm, batch: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold transition">Register</button>
            </form>
        </div>
    );

    const renderHackathonForm = () => (
        <div className="card max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Create a New Hackathon 👩‍💼</h2>
            <form onSubmit={handleHackathonCreate} className="space-y-4">
                <input type="text" placeholder="Hackathon Name" value={hackathonForm.name} onChange={e => setHackathonForm({...hackathonForm, name: e.target.value})} className="w-full p-2 border rounded" required />
                <input type="date" value={hackathonForm.date} onChange={e => setHackathonForm({...hackathonForm, date: e.target.value})} className="w-full p-2 border rounded" required />
                <textarea placeholder="Description" value={hackathonForm.description} onChange={e => setHackathonForm({...hackathonForm, description: e.target.value})} className="w-full p-2 border rounded" rows="3" required></textarea>
                <input type="number" placeholder="Max Teams" value={hackathonForm.max_teams} onChange={e => setHackathonForm({...hackathonForm, max_teams: e.target.value})} className="w-full p-2 border rounded" min="1" required />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold transition">Create Hackathon</button>
            </form>
        </div>
    );

    const renderTeamView = () => (
        <div>
            <button onClick={() => setActiveView('dashboard')} className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">← Back to Dashboard</button>
            <h2 className="text-3xl font-bold mb-6">Teams for {currentHackathon?.name}</h2>
            {currentHackathon?.teams.length === 0 ? <p>No teams have been generated yet.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentHackathon.teams.map(team => (
                        <div key={team.team_id} className="card">
                            <h3 className="text-lg font-bold text-indigo-700 mb-3">{team.team_id}</h3>
                            <ul className="space-y-2">
                                {team.members.map(member => (
                                    <li key={member.id} className="text-gray-700 text-sm">
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen">
            {renderNav()}
            {renderNotification()}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {activeView === 'dashboard' && renderDashboard()}
                {activeView === 'registerStudent' && renderStudentForm()}
                {activeView === 'createHackathon' && renderHackathonForm()}
                {activeView === 'viewTeams' && renderTeamView()}
            </main>
        </div>
    );
}

export default App;