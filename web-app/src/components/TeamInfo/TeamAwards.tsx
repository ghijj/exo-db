import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { getSeasonNameFromId } from '../../SeasonEnum';
import SeasonDropdown from '../Dropdowns/SeasonDropDown';

interface TeamAwardsProps {
  awards: number[];
}

interface AwardData {
  event: { name: string; id: number; code: string | null };
  title: string;
  season: number;
}

const TeamAwards: React.FC<TeamAwardsProps> = ({ awards }) => {
  const [awardData, setAwardData] = useState<AwardData[]>([]);
  const [seasonMap, setSeasonMap] = useState<{ [season: number]: AwardData[] }>({});
  const [selectedSeason, setSelectedSeason] = useState<number>(181);
  const [posts, setPosts] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [champ, setChamps] = useState<number>(0);
  const [skills, setSkills] = useState<number>(0);
  const [exc, setExcs] = useState<number>(0);

  useEffect(() => {
    const fetchAwardDetails = async () => {
      if (awards && awards.length > 0) {
        try {
          setLoading(true);
          const response = await fetch('https://q898umgq45.execute-api.us-east-1.amazonaws.com/dev/awards/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(awards)
          });
          
          if (response.ok) {
            const data: AwardData[] = await response.json();
            setAwardData(data);
          } else {
            console.error('Failed to fetch award details:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching award details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAwardDetails();
  }, [awards]);

  useEffect(() => {
    if (awardData.length === 0) {
      return;
    }
    if (awardData.length > 0) {
      const highestIdAward = awardData.reduce((prev, current) => (prev.event.id > current.event.id ? prev : current));
      if (highestIdAward.season !== null) {
        setSelectedSeason(highestIdAward.season);
      } else {
        setSelectedSeason(181);
      }
    }
    const seasonMap: { [season: number]: AwardData[] } = {};

    let excellence = 0;
    let champ = 0;
    let skills = 0;

    awardData.forEach(award => {
      if (award.title.includes("Tournament Champions")) {
        console.log("hi");
        champ+=1;
      } else if (award.title.includes("Robot Skills Champion")) {
        skills+=1;
      } else if (award.title.includes("Excellence Award")) {
        excellence+=1;
      }

      if (!seasonMap[award.season]) {
        seasonMap[award.season] = [];
      }

      if (!seasonMap[award.season].some(existingAward => existingAward.event.id === award.event.id)) {
        seasonMap[award.season].push(award);
      }
    });

    setChamps(champ);
    setExcs(excellence);
    setSkills(skills);
    setSeasonMap(seasonMap)
    setPosts(false);
  }, [awardData]);

  return (
    <div>
      {loading ? ( // Render loading indicator if loading state is true
        <CircularProgress style={{ margin: '20px' }} />
      ) : posts ? ( 
        <div>No awards found</div>
      ) : (
        <div className="text-black">
          <div className = "flex gap-10 mt-5">
            <div>Total Awards: {awardData.length}</div>
            <div>Total Tournaments Won: {champ}</div>
            <div>Total Skills Won: {skills}</div>
            <div>Total Excellences Won: {exc}</div>
          </div>


          <br />
          <div className="flex justify-center"> 
            <SeasonDropdown
              seasonId={selectedSeason}
              setSeasonId={setSelectedSeason}
              type=''
              grade=''
              restrict={Object.keys(seasonMap)}
            />      
          </div>
          <br />
    
          {/* Display awards and events for selected season */}
          {selectedSeason && seasonMap[selectedSeason] && (
            <div className="border border-gray-300 rounded-md p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">{getSeasonNameFromId(selectedSeason)}</h3>
              {seasonMap[selectedSeason].map((award, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                  <Link to={`/events/${award.event.id}`}>
                  <h4 className="text-md font-semibold mb-2">{award.event.name}</h4>
                  </Link>
                  <ul>
                    {awardData.filter(a => a.event.id === award.event.id && a.season === selectedSeason).map((a, i) => (
                        <li>{a.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamAwards;
