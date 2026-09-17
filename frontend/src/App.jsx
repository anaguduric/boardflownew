// App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Login from './Login';
import Register from './Register';
import Profile from "./Profile";
import Organizations from './components/organizations/Organizations';
import OrganizationDetails from './components/organizations/OrganizationDetails';
import OrganizationMembers from './components/organizations/OrganizationMembers';
import OrganizationRoles from './components/organizations/OrganizationRoles';
import Projects from "./components/projects/Projects";
import CreateProject from "./components/projects/CreateProject";
import Tasks from "./components/tasks/Tasks";
import ProjectDetails from "./components/projects/ProjectDetails";
import CreateTask from "./components/tasks/CreateTask";
import EditTask from "./components/tasks/EditTask";
import RegistrationRequest from "./components/registration/RegistrationRequest";
import Registration from "./components/admin/Registration";
import OtpVerify from "./OtpVerify";
import AcceptInvitation from "./components/organizations/AcceptInvitation";
import TeamList from './components/teams/TeamList';
import TeamDetails from './components/teams/TeamDetails';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/organizations" element={<Organizations />}/>
        <Route path="/organizations/:id" element={<OrganizationDetails />}/> 
        <Route path="/organizations/:id/members" element={<OrganizationMembers />}/>
        <Route path="/organizations/:id/roles" element={<OrganizationRoles />}/> 
        <Route path="/projects" element={<Projects />}/>
        <Route path="/projects/create" element={<CreateProject />}/>
        <Route path="/tasks" element={<Tasks />} />   
        <Route path="/projects/:id" element={<ProjectDetails />}/>
        <Route path="/tasks/create" element={<CreateTask />}/>
        <Route path="/tasks/:id/edit" element={<EditTask />}/>
        <Route path="/register-organization" element={<RegistrationRequest />}/>
        <Route path="/admin/registration" element={<Registration />}/>
        <Route path="/verify-account" element={<OtpVerify />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />}/>
        <Route path="/teams" element={<TeamList />} />
        <Route path="/teams/:id" element={<TeamDetails />}/>
      </Routes>
    </>
  );
}

export default App;
