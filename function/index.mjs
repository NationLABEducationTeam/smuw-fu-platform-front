import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {
    await dynamoDB.send(new PutCommand({
      TableName: 'WebSocketConnections',
      Item: {
        connectionId: connectionId,
        timestamp: new Date().toISOString()
      }
    }));
    
    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('Error connecting:', error);
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(error) };
  }
};