# REST API Documentation

MAKE SURE TO TURN LAMBDA PROXY INTEGRATION ON

Dev API link: `https://q898umgq45.execute-api.us-east-1.amazonaws.com/dev`

## Events

Resource Path: `/events`.

Purpose: To handle information regarding events

Operations:

- GET `/events` to list events (with pagination)
- GET `/events?numberOfEvents={number}` to get n most recent events:  ex `https://q898umgq45.execute-api.us-east-1.amazonaws.com/dev/events?numberOfEvents=10`
  - `?program={'program_code}` - get n most recent events of a specific program code. (DONE)
  - `?start_after={'start_date'}` - get n events that started after {'start_date'} (DONE)
  - `?start_before={'start_date'}` - get n events that started before {'start_date'} (DONE)
  - `?status=ongoing` to get all ongoing events: `https://q898umgq45.execute-api.us-east-1.amazonaws.com/dev/events?status=ongoing`
  - `?region={'region'}` to get events from a specific region. The ?region modifier works with any other modifiers. Can also do a country that has multiple regions within it (ie: China, United States) and it will get events for all regions that country contains.
- POST `/events/ {body: "[{event_id1}, {event_id2}, {event_id3}...]"}` to get details for a set of specific events.

### Sub-Resource: eventId

Resource Path: `/events/{eventId}`

Purpose: Handle information regarding a defined set of events.

Operations:

- GET `/events/{eventId}` to get details for a specific event

### Sub-Sub-Resource: divisions

Resource Path: `/events/{eventId}/divisions`

Purpose: Get information regarding the divisions of a singular event

Operations:

- GET `/events/{eventId}/divisions` to get data for all divisions for a specific event

### Sub-Sub-Sub-Resource: divId

Resource Path: `/events/{eventId}/divisions/{divId}`

Purpose: Get information regarding a singular division at a singular event.

Operations:

- GET `/events/{id}/divisions/{divisionId}` Get details of a specific division within an event

## Teams

Resource Path: `/teams`.

Purpose: To manage information about teams. Return a array of team ids that match the given parameters.

Operations:

- GET `/teams` to list registered teams (with limit 500(update to be more maybe?))
  - GET `/teams?region={region_name}` to get teams from a specific region
  - GET `/teams?registered=false` to get nonregistered teams or ?registered=any to get registered and unregistered teams. Without inclusion, ?registered=true is defaulted to
  - GET `/teams?program={'program_code'}` to get teams from a specific program
  - GET `/teams?responses={responses_number}` to get a variable number of responses that match the given parameters. Defaults to 100, maxes at 500(?).
- POST `/teams/ {body: "[{team_id1}, {team_id2}, {team_id3}...]"}` to get details for a set of specific teams.

### Sub-Resource: teamId

Resource Path: `/teams/{teamId}`

Purpose: Handle information regarding a defined set of teams.

Operations:

- GET `/teams/{teamId}` to get details for a specific team

## Matches

Resource Path: `/matches`.

Purpose: To manage information about matches.

Operations:

- POST `/matches/ {body: "[{match_id1}, {match_id2}, {match_id3}...]"}` to get details for a set of specific matches.

### Sub-Resource: matchId

Resource Path: `/match/{matchid}`

Purpose: Handle information regarding a specific match

Operations:

- GET `/matches/{matchId}` to get details for a specific match

## Search

Resource Path: `/search`

Purpose: To handle search by providing an endpoint to easily query OpenSearch API

### Sub-Resource {queryTerm}

Resource Path: `/search/{queryTerm}`

Purpose: To handle specific search queries

Operations:

- GET `/search/{searchQuery}` to make a specific search query

## Rankings

Resource Path `/rankings`

Purpose: To manage information about rankings

Operations:

- POST `/rankings/ {body: "[{aranking_id1}, {ranking_id2}, {ranking_id3}...]"}` to get details for a set of specific ranking.

### Sub-Resource: rankingId

Resource Path: `/rankings/{rankingId}`

Purpose: Handle information regarding a specific ranking

Operations:

- GET `/rankings/{rankingId}` to get details for a specific ranking

## Awards

Resource Path `/awards`

Purpose: To manage information about awards

Operations:

- POST `/awards/ {body: "[{award_id1}, {award_id2}, {award_id3}...]"}` to get details for a set of specific awards.

### Sub-Resource: awardId

Resource Path: `/awards/{awardId}`

Purpose: Handle information regarding a specific award

Operations:

- GET `/awards/{awardId}` to get details for a specific award

## Skills

Resource Path `/skills`

Purpose: To manage information about skills

Operations:

- POST `/skills/ {body: "[{skill_id1}, {skill_id1}, {skill_id1}...]"}` to get details for a set of specific skills.

### Sub-Resource: skillId

Resource Path: `/skills/{skillId}`

Purpose: Handle information regarding a specific skill

Operations:

- GET `/skills/{skillId}` to get details for a specific skill

## SkillsRanking

Resource Path: `/skills`

Purpose: To get skills-ranking items in different ways

Skills-ranking objects have partition keys `{event_id}-{team_id}` with sort key `type`

It correponds to the highest skills score a certain team got at a certain event.

The highest skill score `{team_id}` got at `{event_id}`.

The object also contains season data and region data, so can be used to query the top skills score of any `type` from a season (global skills leaderboard) or a region and season.

Operations:

- GET `/skillsranking?eventId` to get all skillsranking items from a specific event. This will give the top skills scores made by all teams at the event of all 3 types. It will by default be sorted by score.
- GET `/skillsranking?teamId` to get all skillsranking items for a specific team. These will give the top skills scores the team made at every event they attended of all 3 types. It will by default be sorted by type (this is planned to be changed to sorted by season).
- GET `/skillsranking?eventId={}&teamId={}` to get the skillsranking items for a specific team at a specific event. It will essentially give the values of the highest skills run of each type the team made at the event. ex: `/skillsranking?eventId=28201&teamId=5226&type=robot`
  - The three above can be modified with ?type, which will cause them to only return skillsrankings for a specific `type` (robot, programming, driver). ex `/skillsranking?eventId=28201&teamId=5226&type=robot`
- GET `/skillsranking?season` to get the skillsranking items from a specific season, sorted by score. By default will return the first page of the top 50 items of the given parameters. ?pages allows for page parsing.
  - Can be modified by responses or region:
  - GET `/skillsranking?season={}&region={}` The ?region modifier works with any other modifiers. Can also do a country that has multiple regions within it (ie: China, United States) and it will get rankings for all regions that country contains.
  - GET `/skillsranking?season={}&page={}` -- Will default to == 1
  - GET `/skillsranking?season={}&grade={}` Valid options: ["High School", "Middle School", "Elementary School", "College"]
  - GET `/skillsranking?season={}&type={}` Valid options: ["robot", "driver", "programming"] -- Will default to "robot"

## EloRanking

Resource Path: `eloranking`

Purpose: To get elo-rankings for seasons and regions

Elo Ranking objects have partition keys `{season}-{team_id}` with sort key `elo`

3 query parameters, `season`, `page`, `region`. They all work together in any combination.

For proper use, page and season should be provided instead of relying on defaults

Pages are made up of 50 results

Operations:

- GET `/eloranking` to get the first page of elorankings for the default season, `181`
- GET `/eloranking?page={}` to get a specific page of elorankings for the default season `181`
- GET `/eloranking?season={}&page={}` to get a specific page of elorankings for a specific season (Ideal way to use)
- GET `/elorankings?region={}` to get the first page of elorankings for the default season, `181` for a specific region. The ?region modifier works with any other modifiers. Can also do a country that has multiple regions within it (ie: China, United States) and it will get rankings for all regions that country contains.

## TsRanking

Resource Path: `tsranking`

Purpose: To get elo-rankings for seasons and regions

Elo Ranking objects have partition keys `{season}-{team_id}` with sort key `mu`

3 query parameters, `season`, `page`, `region`. They all work together in any combination.

For proper use, page and season should be provided instead of relying on defaults

Pages are made up of 50 results

Operations:

- GET `/tsranking` to get the first page of tsranking for the default season, `181`
- GET `/tsranking?page={}` to get a specific page of tsranking for the default season `181`
- GET `/tsranking?season={}&page={}` to get a specific page of tsranking for a specific season (Ideal way to use)
- GET `/tsranking?region={}` to get the first page of tsranking for the default season, `181` for a specific region. The ?region modifier works with any other modifiers. Can also do a country that has multiple regions within it (ie: China,   United States) and it will get rankings for all regions that country contains.
  
## LastPage

Resource Path `/lastpage`

Purpose: To manage information about the last page of different types of paginated queries

### Sub-Resource: id

Resource Path: `/lastpage/{id}`

Purpose: Handle information about the last page of a specific paginated query

`id` for elo and trueskill is formed by `{querytype}-{season}` with an optional `-{region}`

## MatchSimulator

Resource Path `/matchsimulator`

Purpose: To determine the win percentage of a 2v2 match based on current trueskill data.

Operations:

- POST `/matchsimulator` to post 4 teams, with the first 2 being red alliance and last 2 being blue alliance. The predicted winrate of red alliance will be returned.


For example:

- `trueskill-181-Washington`
- `elo-182-New Jersey`
- `elo-182`

`id` for skills is formed by `{querytype}-{season}-{skills_type}-{grade}` with an optional `-{region}`, with grade being either `ms`, `hs`, or `college`

For example:

- `skills-181-robot-college-Nebraska`
- `skills-175-programming-ms-Washington`
- `skills-154-driver-hs`

Operations:

- GET `/lastpage/{id}` to get the last page of the specific query

## Init new typescript API function

npm init -y

npm install --save-dev typescript @types/node

npm install dependencies

npx tsc --init

modify tsconfig.json
