import React from 'react';

// Define a functional component that takes in a JSON object as a prop
interface SeasonData {
  name: string;
  id: number;
  code: string | null;
}

interface NameData {
  name: string;
  id: number;
  code: string | null;
}

interface LocationData {
  venue: string;
  country: string;
  city: string;
  address_1: string;
  address_2: string | null;
  postcode: string;
  coordinates: { lat: number; lon: number };
  region: string;
}

interface JSONComponentProps {
  location: LocationData | null;
  season: SeasonData | null;
  name: NameData | null;
  program: String | null;
}

const JSONComponent: React.FC<JSONComponentProps> = ({ location, season, name, program }) => {
  return (
    <div className="mx-auto bg-gray-700 text-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Event Data</h2>
      {location && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Location</h3>
          <p>Venue: {location.venue || 'N/A'}</p>
          <p>Country: {location.country || 'N/A'}</p>
          <p>City: {location.city || 'N/A'}</p>
          <p>Address: {location.address_1 || 'N/A'}</p>
          <p>Region: {location.region || 'N/A'}</p>
        </div>
      )}
      {season && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Season</h3>
          <p>{season.name || 'N/A'}</p>
        </div>
      )}
      {program && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Program</h3>
          <p>{program || 'N/A'}</p>
        </div>
      )}
    </div>

  );
};

export default JSONComponent;
