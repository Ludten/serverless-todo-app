import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters!.todoId!
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info(`delete event: ${event}`)
		const userId = getUserId(event)

		const uploadUrl = await createAttachmentPresignedUrl(todoId, userId)

    return {
			statusCode: 201,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({
				"uploadUrl": uploadUrl
			})
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
