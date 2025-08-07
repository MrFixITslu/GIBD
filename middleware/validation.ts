import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { BusinessCategory } from '../types';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// Business validation
export const validateBusinessCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('category')
    .isIn(Object.values(BusinessCategory))
    .withMessage('Invalid business category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('contact.phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  body('contact.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  handleValidationErrors
];

export const validateBusinessUpdate = [
  param('id')
    .isString()
    .withMessage('Invalid business ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  handleValidationErrors
];

// Event validation
export const validateEventCreate = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Event title must be between 2 and 100 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('businessId')
    .isString()
    .withMessage('Invalid business ID'),
  handleValidationErrors
];

// Itinerary validation
export const validateItineraryRequest = [
  body('interests')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Interests must be between 5 and 200 characters'),
  body('budget')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Budget must be low, medium, or high'),
  body('duration')
    .isInt({ min: 1, max: 14 })
    .withMessage('Duration must be between 1 and 14 days'),
  handleValidationErrors
];

// Generic ID validation
export const validateId = [
  param('id')
    .isString()
    .withMessage('Invalid ID parameter'),
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];
