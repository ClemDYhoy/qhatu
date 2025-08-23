import React, { createContext, useContext, useReducer, useMemo } from 'react';

const AppContext = createContext();

const initialState = {
user: null,
products: [],
searchResults: [],
isLoading: false
};

function appReducer(state, action) {
switch (action.type) {
    case 'SET_PRODUCTS':
    return { ...state, products: action.payload };
    case 'SET_SEARCH_RESULTS':
    return { ...state, searchResults: action.payload };
    case 'SET_LOADING':
    return { ...state, isLoading: action.payload };
    case 'SET_USER':
    return { ...state, user: action.payload };
    default:
    return state;
}
}

export function AppProvider({ children }) {
const [state, dispatch] = useReducer(appReducer, initialState);

const contextValue = useMemo(() => ({ state, dispatch }), [state]);

return (
    <AppContext.Provider value={contextValue}>
    {children}
    </AppContext.Provider>
);
}

export function useApp() {
const context = useContext(AppContext);
if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
}
return context;
}