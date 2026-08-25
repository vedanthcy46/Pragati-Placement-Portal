export const validateNomination = (data) => {
  const errors = {}

  if (!data.student_id) errors.student_id = 'Student ID is required'
  if (!data.company_id) errors.company_id = 'Company ID is required'
  if (!data.company_name || data.company_name.trim().length < 2)
    errors.company_name = 'Company name is required'
  if (data.role && data.role.trim().length < 3)
    errors.role = 'Role must be at least 3 characters'
  if (data.package && isNaN(parseFloat(data.package)))
    errors.package = 'Package must be a valid number'

  return { isValid: Object.keys(errors).length === 0, errors }
}

export const validateNominationUpdate = (data) => {
  const errors = {}
  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Withdrawn']
  if (data.status && !validStatuses.includes(data.status))
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`
  if (data.company_name && data.company_name.trim().length < 2)
    errors.company_name = 'Company name must be at least 2 characters'
  if (data.role && data.role.trim().length < 3)
    errors.role = 'Role must be at least 3 characters'
  if (data.package && isNaN(parseFloat(data.package)))
    errors.package = 'Package must be a valid number'
  if (Object.keys(data).filter(k =>
    ['status', 'remarks', 'company_name', 'role', 'package'].includes(k)
  ).length === 0)
    errors.fields = 'At least one field must be provided for update'
  return { isValid: Object.keys(errors).length === 0, errors }
}