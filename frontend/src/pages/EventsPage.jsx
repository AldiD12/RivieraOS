import { useState, useEffect } from 'react';
import { publicEventsApi } from '../services/eventsApi';
import { venueApi } from '../services/venueApi';
import EventsView from '../components/EventsView';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vibeFilter, setVibeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, venuesData] = await Promise.all([
        publicEventsApi.getEvents(),
        venueApi.getVenues()
      ]);
      
      // Filter only published events
      const publishedEvents = Array.isArray(eventsData) 
        ? eventsData.filter(e => {
            const isPublished = e.isPublished !== undefined ? e.isPublished : true;
            const isDeleted = e.isDeleted !== undefined ? e.isDeleted : false;
            return isPublished && !isDeleted;
          })
        : [];
      
      setEvents(publishedEvents);
      setVenues(venuesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setEvents([]);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    const venue = venues.find(v => v.id === event.venueId);
    if (!venue) {
      console.error('❌ Venue not found for event:', event);
      return;
    }
    
    const whatsappNumber = venue.whatsappNumber || venue.whatsAppNumber || venue.phone;
    
    if (!whatsappNumber) {
      console.error('❌ No WhatsApp number found for venue:', venue.name);
      alert(`Sorry, ${venue.name} doesn't have a WhatsApp number configured yet. Please contact the venue directly.`);
      return;
    }
    
    // Generate WhatsApp message
    const eventDate = new Date(event.startTime).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const eventTime = new Date(event.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `Pershendetje! E pame eventin "${event.name}" ne XIXA dhe donim te rezervonim. `;
    
    let cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    if (cleanNumber.startsWith('+')) cleanNumber = cleanNumber.slice(1);
    else if (cleanNumber.startsWith('0')) cleanNumber = '355' + cleanNumber.slice(1);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Opening WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <EventsView
      events={events}
      venues={venues}
      loading={loading}
      vibeFilter={vibeFilter}
      dateFilter={dateFilter}
      onVibeChange={setVibeFilter}
      onDateChange={setDateFilter}
      onEventClick={handleEventClick}
      isDayMode={false}
    />
  );
}