import React, { useState, useEffect } from 'react';
import EventBasic from './EventBasic';

const App: React.FC = () => {
  const [eventIds, setEventIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the JSON file for ids of recent 10
        const response = await fetch('https://q898umgq45.execute-api.us-east-1.amazonaws.com/dev/events?numberOfEvents=20');
        const result = await response.json();
        setEventIds(result);
      } catch (error) {
        console.error('Error fetching event IDs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        eventIds.map((eventId) => (
          <EventBasic key={eventId} eventId={eventId} />
        ))
      )}
    </div>
  );
};

export default App;