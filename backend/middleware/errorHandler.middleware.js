export const errorHandler = (err, req, res, next) => {
  // Only log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message)
  }

  // 400 - Bad Request
  if (err.message === 'Student is not eligible for nomination')
    return res.status(400).json({ success: false, message: err.message })

  if (err.message === 'Invalid authenticated user id')
    return res.status(400).json({ success: false, message: err.message })

  if (err.message === 'Nomination not found')
    return res.status(404).json({ success: false, message: err.message })

  if (err.message === 'Shortlist entry not found')
    return res.status(404).json({ success: false, message: err.message })

  if (err.message === 'Student not found')
    return res.status(404).json({ success: false, message: err.message })

  if (err.message === 'Eligible student not found')
    return res.status(404).json({ success: false, message: err.message })

  // 409 - Conflict (PostgreSQL unique violation)
  if (err.code === '23505')
    return res.status(409).json({ success: false, message: 'Duplicate entry — student already nominated for this company' })

  // 422 - Validation Error (PostgreSQL check constraint)
  if (err.code === '23514')
    return res.status(422).json({ success: false, message: 'Data validation failed — check constraint violated' })

  // 500 - Internal Server Error (default)
  return res.status(500).json({ success: false, message: 'Internal server error' })
}