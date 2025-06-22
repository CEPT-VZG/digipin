/**
 * Batch processing utilities for DIGIPIN operations
 */

import { 
  Coordinates, 
  DigipinString, 
  BatchOptions, 
  BatchResult 
} from '../types';
import { encode, decode } from '../core/codec';
import { DigipinBatchError } from '../core/errors';
import { DEFAULT_BATCH_OPTIONS } from '../core/constants';

/**
 * Processes items in batches with concurrency control
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param options - Batch processing options
 * @returns Promise with batch results
 */
async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R> | R,
  options: BatchOptions = {}
): Promise<BatchResult<R>> {
  const opts = { ...DEFAULT_BATCH_OPTIONS, ...options };
  const startTime = Date.now();
  
  const results: R[] = [];
  const errors: Array<{ index: number; error: Error; input: T }> = [];
  
  let processed = 0;
  
  // Process items in chunks based on concurrency limit
  for (let i = 0; i < items.length; i += opts.concurrency!) {
    const chunk = items.slice(i, i + opts.concurrency!);
    const chunkPromises = chunk.map(async (item, chunkIndex) => {
      const globalIndex = i + chunkIndex;
      try {
        const result = await processor(item, globalIndex);
        results[globalIndex] = result;
        processed++;
        
        if (opts.onProgress) {
          opts.onProgress(processed, items.length);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ index: globalIndex, error: err, input: item });
        
        if (opts.errorStrategy === 'stop') {
          throw new DigipinBatchError(`Processing stopped at index ${globalIndex}`, {
            index: globalIndex,
            error: err.message,
            processed,
            total: items.length
          });
        }
      }
    });
    
    await Promise.all(chunkPromises);
  }
  
  const duration = Date.now() - startTime;
  
  return {
    results: results.filter(r => r !== undefined),
    errors,
    stats: {
      total: items.length,
      successful: results.filter(r => r !== undefined).length,
      failed: errors.length,
      duration
    }
  };
}

/**
 * Encodes multiple coordinate pairs into DIGIPINs
 * @param coordinates - Array of coordinate pairs
 * @param options - Batch processing options
 * @returns Promise with encoded DIGIPINs
 */
export async function batchEncode(
  coordinates: Coordinates[],
  options: BatchOptions & { format?: boolean } = {}
): Promise<BatchResult<DigipinString>> {
  return processBatch(
    coordinates,
    (coord) => encode(coord.latitude, coord.longitude, { format: options.format }),
    options
  );
}

/**
 * Decodes multiple DIGIPINs into coordinates
 * @param digipins - Array of DIGIPIN strings
 * @param options - Batch processing options
 * @returns Promise with decoded coordinates
 */
export async function batchDecode(
  digipins: DigipinString[],
  options: BatchOptions = {}
): Promise<BatchResult<Coordinates>> {
  return processBatch(
    digipins,
    (digipin) => decode(digipin),
    options
  );
}

/**
 * Validates multiple DIGIPINs
 * @param digipins - Array of DIGIPIN strings to validate
 * @param options - Batch processing options
 * @returns Promise with validation results
 */
export async function batchValidate(
  digipins: DigipinString[],
  options: BatchOptions = {}
): Promise<BatchResult<boolean>> {
  return processBatch(
    digipins,
    (digipin) => {
      try {
        decode(digipin);
        return true;
      } catch {
        return false;
      }
    },
    options
  );
}

/**
 * Synchronous batch encoding (for smaller datasets)
 * @param coordinates - Array of coordinate pairs
 * @param options - Format options
 * @returns Batch result with encoded DIGIPINs
 */
export function batchEncodeSync(
  coordinates: Coordinates[],
  options: { format?: boolean } = {}
): BatchResult<DigipinString> {
  const startTime = Date.now();
  const results: DigipinString[] = [];
  const errors: Array<{ index: number; error: Error; input: Coordinates }> = [];
  
  coordinates.forEach((coord, index) => {
    try {
      const digipin = encode(coord.latitude, coord.longitude, options);
      results.push(digipin);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ index, error: err, input: coord });
    }
  });
  
  const duration = Date.now() - startTime;
  
  return {
    results,
    errors,
    stats: {
      total: coordinates.length,
      successful: results.length,
      failed: errors.length,
      duration
    }
  };
}

/**
 * Synchronous batch decoding (for smaller datasets)
 * @param digipins - Array of DIGIPIN strings
 * @returns Batch result with decoded coordinates
 */
export function batchDecodeSync(digipins: DigipinString[]): BatchResult<Coordinates> {
  const startTime = Date.now();
  const results: Coordinates[] = [];
  const errors: Array<{ index: number; error: Error; input: DigipinString }> = [];
  
  digipins.forEach((digipin, index) => {
    try {
      const coords = decode(digipin);
      results.push(coords);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ index, error: err, input: digipin });
    }
  });
  
  const duration = Date.now() - startTime;
  
  return {
    results,
    errors,
    stats: {
      total: digipins.length,
      successful: results.length,
      failed: errors.length,
      duration
    }
  };
}