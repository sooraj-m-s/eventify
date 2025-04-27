import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompleteRegistration from './pages/auth/CompleteRegistration';
import Login from './pages/auth/Login';


function App() {

  return (
    <>
      <Routes>
        {/* Client Routes */}
        <Route path="client">
          <Route path="register" element={<Register />} />
          <Route path="register/complete" element={<CompleteRegistration />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
      <ToastContainer autoClose={2000}/>
    </>
  )
}

export default App

