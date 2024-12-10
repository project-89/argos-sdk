import { useEffect, useState } from 'react';
import { useArgosSDK } from '../context/ArgosContext';
import { ArgosUser } from '../types/api';

export function useArgosUser() {
  const sdk = useArgosSDK();
  const [user, setUser] = useState<ArgosUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const tracker = sdk.tracker;
    const currentUser = tracker.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, [sdk]);

  const setArgosUser = async (userData: ArgosUser) => {
    try {
      setLoading(true);
      await sdk.tracker.setUser(userData);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set user'));
    } finally {
      setLoading(false);
    }
  };

  const updateArgosUser = async (userData: ArgosUser) => {
    try {
      setLoading(true);
      await sdk.tracker.updateUser(userData);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user'));
    } finally {
      setLoading(false);
    }
  };

  const deleteArgosUser = async () => {
    try {
      setLoading(true);
      await sdk.tracker.deleteUser();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete user'));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    setUser: setArgosUser,
    updateUser: updateArgosUser,
    deleteUser: deleteArgosUser,
  };
}
