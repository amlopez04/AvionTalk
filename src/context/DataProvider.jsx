// context/DataProvider.jsx
import { useState, createContext, useContext } from "react";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [userHeaders, setUserHeaders] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // NEW

  const handleHeaders = (header) => {
    console.log("Setting headers:", header);
    const updatedHeader = {
      'access-token': header['access-token'],
      uid: header.uid,
      expiry: header.expiry,
      client: header.client
    };
    console.log("Formatted headers:", updatedHeader);
    setUserHeaders(updatedHeader);
  };

  console.log("DataProvider state - userHeaders:", userHeaders);
  console.log("DataProvider state - currentUser:", currentUser);

  return (
    <DataContext.Provider value={{
      handleHeaders,
      userHeaders,
      currentUser,
      setCurrentUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

export default DataProvider;
