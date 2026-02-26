import express from 'express'
import cors from 'cors'
import recipeRoutes from './routes/recipes'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/recipes', recipeRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Culinr backend running on http://localhost:${PORT}`)
})
