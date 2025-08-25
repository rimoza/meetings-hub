'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { appointmentsService } from '@/lib/firebase/appointments';
import { Appointment } from '@/types/appointment';
import { toast } from 'sonner';

export function useAppointments() {
  const { user, isLoading: loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useAppointments: useEffect - user:', !!user, 'loading:', loading);
    
    if (!user || loading) {
      if (!loading) {
        setIsLoading(false);
        console.log('useAppointments: No user and not loading, setting isLoading to false');
      }
      return;
    }

    console.log('useAppointments: Setting up real-time subscription for user:', user.uid);
    setIsLoading(true);

    const unsubscribe = appointmentsService.subscribeToAppointments(
      user.uid,
      (fetchedAppointments) => {
        console.log('useAppointments: Real-time update - appointments:', fetchedAppointments.length);
        setAppointments(fetchedAppointments);
        setIsLoading(false);
      }
    );

    if (!unsubscribe) {
      console.error('useAppointments: Failed to set up subscription');
      setIsLoading(false);
      toast.error('Failed to connect to real-time updates');
    }

    return () => {
      if (unsubscribe) {
        console.log('useAppointments: Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [user, loading]);

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const id = await appointmentsService.create(appointment, user.uid);
      toast.success('Appointment created successfully');
      return id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      await appointmentsService.update(id, updates);
      toast.success('Appointment updated successfully');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentsService.delete(id);
      toast.success('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
      throw error;
    }
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.date >= today && appointment.status !== 'cancelled' && appointment.status !== 'completed'
    );
  };

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByStatus,
    getTodaysAppointments,
    getUpcomingAppointments,
    refresh: () => {
      // With real-time updates, refresh is handled automatically
      // This is kept for compatibility but doesn't need to do anything
      console.log('useAppointments: Refresh called (real-time updates are automatic)');
    },
  };
}