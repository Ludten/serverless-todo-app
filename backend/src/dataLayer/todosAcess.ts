import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

	constructor(
		private readonly docClient: DocumentClient = createDynamoDBClient(),
		private readonly todostable = process.env.TODOS_TABLE,
		private readonly todosindex = process.env.TODOS_CREATED_AT_INDEX
	) {}

	async getAllTodos(userId: string): Promise<TodoItem[]> {
		logger.info('Getting all Todos')

		const result = await this.docClient.query({
			TableName: this.todostable,
			IndexName: this.todosindex,
			KeyConditionExpression: 'userId = :id',
			ExpressionAttributeValues: {
				":id": userId
			}
		}).promise()

		const items = result.Items
		return items as TodoItem[]
	}

	async createTodo(todoItem: TodoItem): Promise<TodoItem> {
		await this.docClient.put({
			TableName: this.todostable,
			Item: todoItem
		}).promise()

		return todoItem
	}

	async todoExists(todoId: string, userId: string) {
		const result = await this.docClient.get({
      TableName: this.todostable,
      Key: {
        "userId": userId,
				"todoId": todoId
      }
    }).promise()
		logger.info(`Getting Todo ${result}`)
		return !!result.Item
	}

	async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate) {
		return await this.docClient.update({
			TableName: this.todostable,
			Key: {
				"userId": userId,
				"todoId": todoId
			},
			UpdateExpression: "set #n = :n, dueDate = :d, done = :t",
			ExpressionAttributeValues: {
				':n' : todoUpdate.name,
				':d' : todoUpdate.dueDate,
				':t' : todoUpdate.done
			},
			ExpressionAttributeNames: {
                                "#n": "name",
                        }
		}).promise()
	}

	async deleteTodoItem(todoId: string, userId: string) {
		return await this.docClient.delete({
			TableName: this.todostable,
			Key: {
				"userId": userId,
				"todoId": todoId
			}
		}).promise()
	}

	async PresignedUrl(todoId: string, userId: string, url: string) {
		return await this.docClient.update({
			TableName: this.todostable,
			Key: {
				"userId": userId,
				"todoId": todoId
			},
			UpdateExpression: "set attachmentUrl = :u",
			ExpressionAttributeValues: {
				':u' : url
			}
		}).promise()
	}

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
