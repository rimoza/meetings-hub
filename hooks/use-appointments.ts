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

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const fetchedAppointments = await appointmentsService.getAll(user.uid);
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading]);

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const id = await appointmentsService.create(appointment, user.uid);
      const newAppointment = {
        ...appointment,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAppointments(prev => [newAppointment, ...prev]);
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
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id
            ? { ...appointment, ...updates, updatedAt: new Date() }
            : appointment
        )
      );
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
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
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
    refresh: fetchAppointments,
  };
}