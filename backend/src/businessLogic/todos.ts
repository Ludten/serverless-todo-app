import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const logger = createLogger('todos')
const bucketName = process.env.ATTACHMENT_S3_BUCKET

const todosAcess = new TodosAccess()

export async function getTodosForUser(userId: string):Promise<TodoItem[]> {
	logger.info('Getting all Todos')
	return todosAcess.getAllTodos(userId)
}

export async function createTodo(
	createTodoRequest: CreateTodoRequest,
	userId: string): Promise<TodoItem> {

	const itemId = uuid.v4()
	logger.info('Create Todo')

	return await todosAcess.createTodo({
		userId: userId,
		todoId: itemId,
		createdAt: new Date().toISOString(),
		name: createTodoRequest.name,
		dueDate: createTodoRequest.dueDate,
		done: false,
	})
}

export async function updateTodo(
	updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string) {
		logger.info('Update Todo')
		const update: TodoUpdate = {
			name: updateTodoRequest.name,
			dueDate: updateTodoRequest.dueDate,
			done: updateTodoRequest.done
		}

		return await todosAcess.updateTodo(
		todoId, userId, update)
}

export async function deleteTodo(
	todoId: string, userId: string) {
		logger.info('Delete Todo')
		return await todosAcess.deleteTodoItem(
		todoId,
		userId
	)
}

export async function createAttachmentPresignedUrl(
	todoId: string, userId: string) {
	logger.info('Generate presignedurl')

	const imageId = userId + todoId

	await todosAcess.PresignedUrl(
		todoId,
		userId,
		`https://${bucketName}.s3.amazonaws.com/${imageId}`
	)
	logger.info('storing image')
	return await AttachmentUtils(imageId)
}
