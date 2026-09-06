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
      </Routes>
    </>
  );
}

export default App;
