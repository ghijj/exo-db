import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { getSeasonNameFromId } from '../../SeasonEnum';
import SeasonDropdown from '../Dropdowns/SeasonDropDown';

interface TeamSkillsProps {
  skills: number[];
}

const TeamSkills: React.FC<TeamSkillsProps> = ({ skills }) => {
  const [seasonMap, setSeasonMap] = useState<{ [key: number]: any[] }>({});
  const [selectedSeason, setSelectedSeason] = useState<number>(181);
  const [posts, setPosts] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [groupsOf50, setGroupsOf50] = useState<number[][]>([]);
  const [isFirstUseEffectDone, setIsFirstUseEffectDone] = useState<boolean>(false);
  
  const divideIntoGroups = (arr: number[], groupSize: number): number[][] => {
    const groups: number[][] = [];
    for (let i = 0; i < arr.length; i += groupSize) {
        groups.push(arr.slice(i, i + groupSize));
    }
    return groups;
  };

  useEffect(() => {
      if (skills) {
          const groupedIds: number[][] = divideIntoGroups(skills, 50);
          setGroupsOf50(groupedIds); 
          setIsFirstUseEffectDone(true);
      }
  }, [skills]);

  useEffect(() => {
    const fetchSkillsDetails = async () => {
      if (skills && skills.length > 0) {
        try {
          setLoading(true);
          const allEvents: any[] = [];
          for (let i = 0; i < groupsOf50.length; i++) {
              const response = await fetch('https://q898umgq45.execute-api.us-east-1.amazonaws.com/dev/skills/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(groupsOf50[i])
              });
              const data = await response.json();
              allEvents.push(...data);
          }
          console.log(allEvents);

          const tempSeasonMap: { [season: number]: any[] } = {};
          allEvents.forEach(event => {
              if (!tempSeasonMap[event.season.id]) {
                  tempSeasonMap[event.season.id] = [];
              }
              tempSeasonMap[event.season.id].push(event);
          });

          setSeasonMap(tempSeasonMap);
          setSelectedSeason(Math.max(...Object.keys(tempSeasonMap).map(Number)));
          console.log(seasonMap);
        } catch (error) {
          console.error('Error fetching award details:', error);
        } finally {
          setPosts(false);
          setLoading(false);
        }
      }
    };

    fetchSkillsDetails();
  }, [skills, isFirstUseEffectDone]);

  return (
    <div>
      {loading ? ( // Render loading indicator if loading state is true
        <CircularProgress style={{ margin: '20px' }} />
      ) : posts ? (  // no skills :)
        <div>No skills found</div>
      ) : (
        <div className="text-black">
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
          <div>
          {seasonMap[selectedSeason] && Array.isArray(seasonMap[selectedSeason]) && seasonMap[selectedSeason].map((skills, index) => (
                <div className={`body-cell ${index % 2 === 0 ? 'bg-opacity-65' : ''}`}>
                    <Link to={`/events/${skills.event_id}`}>
                      {skills.event_name}
                    </Link>
                    <div> 
                      Skills Score: {skills.score}
                    </div>
                    <div>
                      Skills Rank: {skills.rank}
                    </div>
                    <div>
                      Attempts: {skills.attempts}
                    </div>
                </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default TeamSkills;
