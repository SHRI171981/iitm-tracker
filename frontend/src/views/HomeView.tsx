import { useContext } from 'react';
import { AuthContext } from "@/contexts/AuthContext";


const HomeView: React.FC = () => {
  const auth = useContext(AuthContext);

  return (
    <div>
        <h1>Hi, {auth.user?.user_id}</h1>
    </div>
  )
}
export default HomeView;