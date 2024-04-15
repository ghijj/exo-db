import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { getSeasonNameFromId } from '../../SeasonEnum';
import SeasonDropdown from '../Dropdowns/SeasonDropDown';

// The component displays all the team awards

interface TeamAwardsProps {
    awards: number[];
}

interface AwardData {
    event: { name: string; id: number; code: string | null };
    title: string;
    season: number;
}

const TeamAwards: React.FC<TeamAwardsProps> = ({ awards }) => {
    const [awardData] = useState<AwardData[]>([]);
    const [seasonMap, setSeasonMap] = useState<{ [season: number]: AwardData[] }>({});
    const [selectedSeason, setSelectedSeason] = useState<number>(181);
    const [posts, setPosts] = useState(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [champ, setChamps] = useState<number>(0);
    const [skills, setSkills] = useState<number>(0);
    const [exc, setExcs] = useState<number>(0);
    const [groupsOf100, setGroupsOf100] = useState<number[][]>([]);
    const [isFirstUseEffectDone, setIsFirstUseEffectDone] = useState<boolean>(false);

    const divideIntoGroups = (arr: number[], groupSize: number): number[][] => {
        const groups: number[][] = [];
        for (let i = 0; i < arr.length; i += groupSize) {
            groups.push(arr.slice(i, i + groupSize));
        }
        return groups;
    };
    
    // If the awrads change, split them up to process
    useEffect(() => {
        if (awards) {
            const groupedIds: number[][] = divideIntoGroups(awards, 100);
            setGroupsOf100(groupedIds); 
            setIsFirstUseEffectDone(true);
        } else {
            setLoading(false);
        }
    }, [awards]);

    // Once the first useEffect is done, poll the award data from API and store in awardData
    useEffect(() => {
        if (!isFirstUseEffectDone) {
            return;
        }
        const fetchAwardDetails = async () => {
            if (awards && awards.length > 0) {
                try {
                    setLoading(true);
                        for (let i = 0; i < groupsOf100.length; i++) {
                            const response = await fetch(`${process.env.REACT_APP_API_URL}/dev/awards/`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(groupsOf100[i])
                        });
                        if (response.ok) {
                            const data: AwardData[] = await response.json();
                            awardData.push(...data);
                        } else {
                            console.error('Failed to fetch award details:', response.statusText);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching award details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAwardDetails();
    }, [awards,  isFirstUseEffectDone, groupsOf100, awardData]);

    // Once award data has loaded, get general award info
    useEffect(() => {
        if (loading) {
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
    }, [awardData, loading]);

    return (
        <div>
            {loading ? ( // Render loading indicator if loading state is true
                <CircularProgress style={{ margin: '20px' }} />
            ) : posts ? ( 
                <div>No awards found</div>
            ) : (
              
                <div className="text-black">

                    {/*header general award info display*/}
                    <div className = "team-profile-info">
                        <div className="team-profile-row">
                            <span className="team-profile-rank-label">Total Awards </span>
                            <span className="team-profile-rank-value">{awardData.length}</span>
                        </div>
                        <div className="team-profile-row">
                            <span className="team-profile-rank-label"> Total Tournaments Won </span>
                            <span className="team-profile-rank-value">{champ}</span>
                        </div>
                        <div className="team-profile-row">
                            <span className="team-profile-rank-label">Total Skills Won </span>
                            <span className="team-profile-rank-value">{skills}</span>
                        </div>
                        <div className="team-profile-row">
                            <span className="team-profile-rank-label"> Total Excellences Won </span>
                            <span className="team-profile-rank-value">{exc}</span>
                        </div>
                    </div>

                    {/* Dropdown */}
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
