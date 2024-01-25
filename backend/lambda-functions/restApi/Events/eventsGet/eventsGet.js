import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client
const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Function to get the n most recent events
const getRecentEvents = async (numberOfEvents) => {
    const params = {
        TableName: 'event-data', // replace with your DynamoDB table name
        IndexName: 'EventsByStartDateGSI', // GSI name
        KeyConditionExpression: '#partition_key = :partition_value',
        ExpressionAttributeNames: {
            '#partition_key': 'gsiPartitionKey', // partition key name used in GSI
            '#id': 'id' // Attribute to project
        },
        ExpressionAttributeValues: {
            ':partition_value': 'ALL_EVENTS', // partition key value
        },
        ProjectionExpression: '#id', // Only return the 'id' attribute
        ScanIndexForward: false, // false for descending order
        Limit: numberOfEvents
    };

    try {
        const command = new QueryCommand(params);
        const data = await docClient.send(command);
        return data.Items;
    } catch (error) {
        console.error('Error fetching recent events:', error);
        throw error;
    }
};

// Function to get ongoing events
const getOngoingEvents = async () => {
    const params = {
        TableName: 'event-data', 
        IndexName: 'OngoingEventsIndex', 
        KeyConditionExpression: 'ongoing = :ongoingValue',
        ExpressionAttributeValues: {
            ':ongoingValue': 'true'
        },
        ProjectionExpression: 'id'
    };

    try {
        const command = new QueryCommand(params);
        const result = await docClient.send(command);
        return result.Items;
    } catch (error) {
        console.error('Error fetching ongoing events:', error);
        throw error;
    }
};

export const handler = async (event) => {
    console.log('Received event:', event);

    // Check if the 'numberOfEvents' query parameter is provided
    const numberOfEventsInput = event.queryStringParameters?.numberOfEvents;
    const isOngoingQuery = event.queryStringParameters?.status === 'ongoing';

    try {
        let result;

        if (numberOfEventsInput) {
            const numberOfEvents = parseInt(numberOfEventsInput, 10);
            if (isNaN(numberOfEvents) || numberOfEvents <= 0) {
                throw new Error("Invalid 'numberOfEvents' parameter. Must be a positive number.");
            }
            result = await getRecentEvents(numberOfEvents);
        } else if (isOngoingQuery) {
            result = await getOngoingEvents();
        } else {
            throw new Error("Missing query parameter. Please specify either 'numberOfEvents' or 'status=ongoing'.");
        }

        const eventIds = result.map(item => item.id);
        console.log('Event IDs:', eventIds);

        return {
            statusCode: 200,
            body: JSON.stringify(eventIds)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Failed to fetch events' })
        };
    }
};