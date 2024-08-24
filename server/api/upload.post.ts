import { defineEventHandler, readBody } from 'h3'
import { randomUUID } from 'crypto'
import { writeFile } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const file = body.file

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded',
    })
  }

  const buffer = Buffer.from(file.data, 'base64')
  const filename = `${randomUUID()}${path.extname(file.name)}`
  const filepath = path.join('uploads', filename)

  await writeFile(filepath, buffer)

  const fileUrl = `/uploads/${filename}`
  return { fileUrl }
})