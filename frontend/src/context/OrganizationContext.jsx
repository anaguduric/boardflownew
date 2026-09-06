import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from './AuthContext';

const OrganizationContext = createContext(null);

export function OrganizationProvider({ children }) {

  const { token } = useAuth();

  const [organizations, setOrganizations] = useState([]);

  const [currentOrganization, setCurrentOrganization] =
    useState(null);

  const [loading, setLoading] = useState(true);


  // =====================================================
  // UČITAVANJE ORGANIZACIJA IZ BAZE
  // =====================================================

  useEffect(() => {

    if (!token) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }


    const loadOrganizations = async () => {

      try {

        setLoading(true);

        const res = await fetch(
          'http://localhost:3000/organizations/my',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        if (!res.ok) {
          throw new Error(
            'Greška pri učitavanju organizacija'
          );
        }


        const data = await res.json();

        console.log(
          'ORGANIZACIJE IZ BAZE:',
          data
        );


        setOrganizations(data);


        // =================================================
        // PROVERA PRETHODNO IZABRANE ORGANIZACIJE
        // =================================================

        const saved =
          localStorage.getItem(
            'currentOrganization'
          );


        let savedOrganization = null;


        if (saved) {

          try {

            savedOrganization =
              JSON.parse(saved);

          } catch {

            localStorage.removeItem(
              'currentOrganization'
            );

          }

        }


        // =================================================
        // PROVERA DA LI JE SAVED ORGANIZATION JOŠ VALIDAN
        // =================================================

        const validSavedOrganization =
          data.find(
            (organization) =>
              organization.organization_id ===
              savedOrganization?.organization_id
          );


        // =================================================
        // AKO POSTOJI → KORISTI NJU
        // AKO NE POSTOJI → UZMI PRVU IZ BAZE
        // =================================================

        if (validSavedOrganization) {

          setCurrentOrganization(
            validSavedOrganization
          );

          localStorage.setItem(
            'currentOrganization',
            JSON.stringify(
              validSavedOrganization
            )
          );

        } else if (data.length > 0) {

          setCurrentOrganization(
            data[0]
          );

          localStorage.setItem(
            'currentOrganization',
            JSON.stringify(
              data[0]
            )
          );

        } else {

          setCurrentOrganization(null);

          localStorage.removeItem(
            'currentOrganization'
          );

        }

      } catch (error) {

        console.error(
          'Greška pri učitavanju organizacija:',
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadOrganizations();

  }, [token]);


  // =====================================================
  // RUČNI IZBOR ORGANIZACIJE
  // =====================================================

  const selectOrganization = (organization) => {

    setCurrentOrganization(
      organization
    );

    localStorage.setItem(
      'currentOrganization',
      JSON.stringify(organization)
    );

  };


  // =====================================================
  // CLEAR
  // =====================================================

  const clearOrganization = () => {

    setCurrentOrganization(null);

    localStorage.removeItem(
      'currentOrganization'
    );

  };


  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        selectOrganization,
        clearOrganization,
        loading,
      }}
    >

      {children}

    </OrganizationContext.Provider>
  );
}


export function useOrganization() {

  const context =
    useContext(
      OrganizationContext
    );


  if (!context) {

    throw new Error(
      'useOrganization mora biti korišćen unutar OrganizationProvider-a'
    );

  }


  return context;
}