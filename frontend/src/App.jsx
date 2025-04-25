import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  return (
    <>
      <Routes>
        {/* Client Routes */}
        <Route path="/client">
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
      <ToastContainer autoClose={2000}/>
    </>
  )
}

export default App

