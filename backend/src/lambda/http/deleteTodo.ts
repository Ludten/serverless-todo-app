import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    logger.info(`delete event: ${event}`)
		const userId = getUserId(event)

		await deleteTodo(todoId, userId)

		return {
			statusCode: 201,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true
			},
			body: ''
		}
	}
)

handler
 .use(httpErrorHandler())
 .use(
     cors({
       credentials: true
  })
)
