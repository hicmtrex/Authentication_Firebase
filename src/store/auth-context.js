import React, { useState ,useEffect, useCallback} from 'react';

let logoutTime;

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => { },
    logout: () => { }
});

const calculateRemainingTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjExpirationTime = new Date(expirationTime).getTime();
  
    const remainingDuration = adjExpirationTime - currentTime;
  
    return remainingDuration;
};
const retriveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationTime');
    const remainingTime = calculateRemainingTime(storedExpirationDate);

    if (remainingTime <= 3600) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        return null
    }
    return {
        token: storedToken,
        duration: remainingTime
    };
   }  

export const AuthContextProvider = (props) => {
    const tokenData = retriveStoredToken();
    let initialToken;
    if (initialToken) {
        initialToken = tokenData.token 
    }
    const [token, setToken] = useState(initialToken);

    const userIsLoggedIn = !!token;

    const logoutHandler = useCallback(() => {
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('expirationTime');
        if (logoutTime) {
            clearTimeout(logoutTime)
        }
    },[]);
    
    const loginHandler = (token, expirationTime) => {
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime',expirationTime)
    
        const remainingTime = calculateRemainingTime(expirationTime);
    
        logoutTime = setTimeout(logoutHandler, remainingTime);
    };
    useEffect(() => {
        if (tokenData) {
            logoutTime = setTimeout(logoutHandler, tokenData.duration);    
          }
      },[tokenData,logoutHandler])


    const contextValue = {
        token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout:logoutHandler,
    }

    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
}


export default AuthContext