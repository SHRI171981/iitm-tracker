import { Outlet } from 'react-router-dom';
import NavBar from '@/components/nav/NavBar'; 

const App = () => {

  return (
    <>
      <NavBar />
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default App;