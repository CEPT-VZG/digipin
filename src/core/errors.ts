/**
 * Custom Error Classes for DIGIPIN Library
 */

import { DigipinError } from '../types';

/** Base DIGIPIN error class */
export class BaseDigipinError extends Error implements DigipinError {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DigipinError';
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseDigipinError);
    }
  }
}

/** Invalid input error */
export class DigipinValidationError extends BaseDigipinError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'DigipinValidationError';
  }
}

/** Invalid coordinates error */
export class DigipinCoordinatesError extends BaseDigipinError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'COORDINATES_ERROR', details);
    this.name = 'DigipinCoordinatesError';
  }
}

/** Invalid DIGIPIN format error */
export class DigipinFormatError extends BaseDigipinError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FORMAT_ERROR', details);
    this.name = 'DigipinFormatError';
  }
}

/** Out of bounds error */
export class DigipinBoundsError extends BaseDigipinError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BOUNDS_ERROR', details);
    this.name = 'DigipinBoundsError';
  }
}

/** Processing error for batch operations */
export class DigipinBatchError extends BaseDigipinError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BATCH_ERROR', details);
    this.name = 'DigipinBatchError';
  }
}

/** Plugin error */
export class DigipinPluginError extends BaseDigipinError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PLUGIN_ERROR', details);
    this.name = 'DigipinPluginError';
  }
}