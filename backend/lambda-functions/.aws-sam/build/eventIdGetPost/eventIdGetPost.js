"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const node_stream_1 = require("node:stream");
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: 'us-east-1' });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(ddbClient);
const s3Client = new client_s3_1.S3Client({ region: "us-east-1" });
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
};
async function fetch_divisions_from_s3(s3_reference) {
    // Extract the bucket name and key from the S3 reference
    const match = s3_reference.match(/^s3:\/\/([^\/]+)\/(.+)$/);
    if (!match) {
        throw new Error("Invalid S3 reference format");
    }
    const [, bucketName, key] = match;
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    const { Body } = await s3Client.send(command);
    if (Body instanceof node_stream_1.Readable) {
        const divisionsData = await streamToString(Body);
        return JSON.parse(divisionsData);
    }
    else {
        throw new Error("Expected a readable stream for S3 object body");
    }
}
// Function to get specific event details for a GET request
const getEventDetails = async (eventId) => {
    const numericEventId = Number(eventId);
    const params = {
        TableName: 'event-data',
        KeyConditionExpression: 'id = :eventIdValue',
        ExpressionAttributeValues: {
            ':eventIdValue': numericEventId,
        },
    };
    try {
        const command = new lib_dynamodb_1.QueryCommand(params);
        const result = await docClient.send(command);
        let items = result.Items ?? [];
        for (let item of items) {
            if (item && item.divisions && item.divisions.divisions_s3_reference) {
                const divisions = await fetch_divisions_from_s3(item.divisions.divisions_s3_reference);
                console.log(divisions);
                item.divisions = divisions;
            }
        }
        return result.Items;
    }
    catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
};
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}
// Function to get details for multiple events for a POST request
const getMultipleEventDetails = async (eventIds) => {
    const numericEventIds = eventIds.map(id => ({ id: Number(id) }));
    const params = {
        RequestItems: {
            'event-data': {
                Keys: numericEventIds,
                ProjectionExpression: "id, #name, #start, #end, #location, #region, #season, #program, #level",
                ExpressionAttributeNames: {
                    "#name": "name",
                    "#start": "start",
                    "#end": "end",
                    "#location": "location",
                    "#region": "region",
                    "#season": "season",
                    "#program": "program",
                    "#level": "level"
                }
            }
        }
    };
    try {
        const command = new lib_dynamodb_1.BatchGetCommand(params);
        const result = await docClient.send(command);
        return result.Responses?.['event-data'];
    }
    catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};
// Updated handler to support both GET and POST requests
const handler = async (event) => {
    console.log('Received event:', event);
    try {
        if (event.httpMethod === 'GET') {
            const eventId = event.pathParameters?.eventId;
            if (eventId) {
                const eventDetails = await getEventDetails(eventId);
                return {
                    statusCode: 200,
                    headers: headers,
                    body: JSON.stringify(eventDetails)
                };
            }
            else {
                throw new Error("Event Id not properly provided through path parameters");
            }
        }
        else if (event.httpMethod === 'POST') {
            let eventIds;
            try {
                const parsedBody = JSON.parse(event.body || '[]');
                if (Array.isArray(parsedBody)) {
                    eventIds = parsedBody;
                }
                else {
                    throw new Error("Request body is not an array");
                }
            }
            catch (parseError) {
                console.error('Parsing error:', parseError);
                return {
                    statusCode: 400,
                    headers: headers,
                    body: JSON.stringify({ error: "Failed to parse request body as JSON array" }),
                };
            }
            const eventDetails = await getMultipleEventDetails(eventIds);
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(eventDetails),
            };
        }
        else {
            throw new Error("Unsupported HTTP method");
        }
    }
    catch (error) {
        console.error('Error:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Failed to process request';
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: errorMessage })
        };
    }
};
exports.handler = handler;
