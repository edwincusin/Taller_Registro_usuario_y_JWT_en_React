import { createContext, useContext } from "react"; 


const AppContext = createContext();



export function AppProvider(props) { // componente que envuelve toda la app en main.jsx
    
const { children } = props;

    const nombreEmpresa="TecnologysEdwin"
    const mensajeBienvenida="Bienvenido a ";

    return ( // devuelve la caja con los datos disponibles para toda la app
        <AppContext.Provider value={{ nombreEmpresa, mensajeBienvenida }}> 
            {children} 
        </AppContext.Provider>
    );
}

export function useAppContext(){ // hook personalizado → atajo para no escribir useContext(AuthContext) cada vez
    return useContext(AppContext); // devuelve { token, login, logout } para usar en cualquier componente
}