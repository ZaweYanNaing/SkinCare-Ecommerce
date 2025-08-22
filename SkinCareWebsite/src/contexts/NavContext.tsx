import { createContext, useState } from 'react';

const NavContext = createContext({} as any);

const NavProvider = ({ children }: any) => {
  const [showNavBar, setShowNavBar] = useState<boolean>(false);

  return <NavContext.Provider value={{ showNavBar, setShowNavBar }}>{children}</NavContext.Provider>;
};
export { NavContext, NavProvider };
