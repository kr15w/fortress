import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storeUsername } from "@/utils/auth";  

const Processing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = new URLSearchParams(location.search).get("username");

  useEffect(() => {
    if (username) {
      storeUsername(username); 
      navigate("/menu"); 
    }
  }, [username, navigate]);

  return <p></p>;
};

export default Processing;
