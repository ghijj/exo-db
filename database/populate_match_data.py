import boto3
import json
from decimal import Decimal

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
    
def transform_match_data(match):
    # Check if 'match' is a dictionary and has an 'id' key
    if isinstance(match, dict) and 'id' in match:
        match['id'] = match.pop('id')  # Set the 'id' at the top level
        return match
    else:
        return None


def scan_and_extract_matches(event_table):
    scan_kwargs = {}
    done = False
    start_key = None

    while not done:
        if start_key:
            scan_kwargs['ExclusiveStartKey'] = start_key
        response = event_table.scan(**scan_kwargs)
        for item in response.get('Items', []):
            if 'divisions' in item:
                divisions = item['divisions']
                for division in divisions:
                    if 'matches' in division:
                        matches = division['matches']
                        for match in matches:
                            transformed_match = transform_match_data(match)
                            if transformed_match is not None:
                                yield transformed_match
        start_key = response.get('LastEvaluatedKey', None)
        done = start_key is None


def batch_write_matches(match_table, matches):
    with match_table.batch_writer() as batch:
        for match in matches:
            batch.put_item(Item=match)


if __name__ == '__main__':
    event_table = dynamodb.Table('event-data')
    match_table = dynamodb.Table('match-data')

    # Create a generator to yield matches from the event-data table
    matches_generator = scan_and_extract_matches(event_table)

    # Temporary list to hold matches for batch writing
    temp_matches = []
    count = 0
    for match in matches_generator:
        temp_matches.append(match)
        # Batch write when we have enough matches or at the end
        if len(temp_matches) >= 25:  # DynamoDB batch write limit
            batch_write_matches(match_table, temp_matches)
            print(f"Wrote batch {count}")
            count += 1
            temp_matches = []  # Reset the temp list after batch writing

    # Write any remaining matches
    if temp_matches:
        batch_write_matches(match_table, temp_matches)