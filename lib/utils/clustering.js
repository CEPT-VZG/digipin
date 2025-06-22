/**
 * Clustering Algorithms for DIGIPIN Analysis
 * Various clustering methods for grouping DIGIPIN locations
 */

const { decode } = require('../core/decoder');
const { haversineDistance } = require('./distance');

/**
 * K-means clustering for DIGIPIN coordinates
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} k - Number of clusters
 * @param {number} maxIterations - Maximum iterations
 * @returns {Object} Clustering result with centroids and assignments
 */
function kMeansClustering(digipins, k = 3, maxIterations = 100) {
  if (digipins.length < k) {
    throw new Error('Number of DIGIPINs must be greater than or equal to k');
  }

  // Convert DIGIPINs to coordinates
  const points = digipins.map(digipin => {
    const decoded = decode(digipin);
    return {
      digipin,
      lat: decoded.latitude,
      lon: decoded.longitude
    };
  });

  // Initialize centroids randomly
  let centroids = [];
  const shuffled = [...points].sort(() => 0.5 - Math.random());
  for (let i = 0; i < k; i++) {
    centroids.push({
      lat: shuffled[i].lat,
      lon: shuffled[i].lon,
      cluster: i
    });
  }

  let assignments = new Array(points.length);
  let hasChanged = true;
  let iteration = 0;

  while (hasChanged && iteration < maxIterations) {
    hasChanged = false;

    // Assign points to nearest centroids
    points.forEach((point, index) => {
      let minDistance = Infinity;
      let nearestCluster = 0;

      centroids.forEach((centroid, clusterIndex) => {
        const distance = haversineDistance(
          point.lat, point.lon,
          centroid.lat, centroid.lon
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestCluster = clusterIndex;
        }
      });

      if (assignments[index] !== nearestCluster) {
        hasChanged = true;
        assignments[index] = nearestCluster;
      }
    });

    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPoints = points.filter((_, index) => assignments[index] === i);
      
      if (clusterPoints.length > 0) {
        const sumLat = clusterPoints.reduce((sum, point) => sum + point.lat, 0);
        const sumLon = clusterPoints.reduce((sum, point) => sum + point.lon, 0);
        
        centroids[i].lat = sumLat / clusterPoints.length;
        centroids[i].lon = sumLon / clusterPoints.length;
      }
    }

    iteration++;
  }

  // Group results by cluster
  const clusters = {};
  points.forEach((point, index) => {
    const clusterIndex = assignments[index];
    if (!clusters[clusterIndex]) {
      clusters[clusterIndex] = [];
    }
    clusters[clusterIndex].push(point.digipin);
  });

  return {
    clusters,
    centroids: centroids.map(c => ({ latitude: c.lat, longitude: c.lon })),
    iterations: iteration,
    converged: !hasChanged
  };
}

/**
 * DBSCAN clustering for DIGIPIN density-based clustering
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} epsilon - Maximum distance for neighborhood (in meters)
 * @param {number} minPoints - Minimum points required to form a cluster
 * @returns {Object} Clustering result with clusters and noise points
 */
function dbscanClustering(digipins, epsilon = 1000, minPoints = 3) {
  const points = digipins.map(digipin => {
    const decoded = decode(digipin);
    return {
      digipin,
      lat: decoded.latitude,
      lon: decoded.longitude,
      visited: false,
      cluster: null
    };
  });

  let clusterIndex = 0;
  const clusters = {};
  const noise = [];

  points.forEach(point => {
    if (point.visited) return;
    
    point.visited = true;
    const neighbors = getNeighborPoints(point, points, epsilon);

    if (neighbors.length < minPoints) {
      noise.push(point.digipin);
    } else {
      const currentCluster = clusterIndex++;
      clusters[currentCluster] = [];
      expandCluster(point, neighbors, currentCluster, clusters, points, epsilon, minPoints);
    }
  });

  return {
    clusters,
    noise,
    totalClusters: clusterIndex
  };
}

/**
 * Get neighboring points within epsilon distance
 * @param {Object} point - Current point
 * @param {Array<Object>} points - All points
 * @param {number} epsilon - Distance threshold
 * @returns {Array<Object>} Neighboring points
 */
function getNeighborPoints(point, points, epsilon) {
  return points.filter(otherPoint => {
    if (point === otherPoint) return false;
    
    const distance = haversineDistance(
      point.lat, point.lon,
      otherPoint.lat, otherPoint.lon
    );
    
    return distance <= epsilon;
  });
}

/**
 * Expand cluster in DBSCAN algorithm
 * @param {Object} point - Current point
 * @param {Array<Object>} neighbors - Neighbor points
 * @param {number} clusterIndex - Current cluster index
 * @param {Object} clusters - Clusters object
 * @param {Array<Object>} points - All points
 * @param {number} epsilon - Distance threshold
 * @param {number} minPoints - Minimum points threshold
 */
function expandCluster(point, neighbors, clusterIndex, clusters, points, epsilon, minPoints) {
  point.cluster = clusterIndex;
  clusters[clusterIndex].push(point.digipin);

  let i = 0;
  while (i < neighbors.length) {
    const neighborPoint = neighbors[i];

    if (!neighborPoint.visited) {
      neighborPoint.visited = true;
      const neighborNeighbors = getNeighborPoints(neighborPoint, points, epsilon);

      if (neighborNeighbors.length >= minPoints) {
        neighbors.push(...neighborNeighbors);
      }
    }

    if (neighborPoint.cluster === null) {
      neighborPoint.cluster = clusterIndex;
      clusters[clusterIndex].push(neighborPoint.digipin);
    }

    i++;
  }
}

/**
 * Hierarchical clustering using single linkage
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} threshold - Distance threshold for merging clusters
 * @returns {Object} Hierarchical clustering result
 */
function hierarchicalClustering(digipins, threshold = 5000) {
  const points = digipins.map(digipin => {
    const decoded = decode(digipin);
    return {
      digipin,
      lat: decoded.latitude,
      lon: decoded.longitude
    };
  });

  // Initialize each point as its own cluster
  let clusters = points.map((point, index) => ({
    id: index,
    points: [point],
    center: { lat: point.lat, lon: point.lon }
  }));

  const dendrogram = [];

  while (clusters.length > 1) {
    let minDistance = Infinity;
    let mergeIndices = [0, 1];

    // Find closest pair of clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = haversineDistance(
          clusters[i].center.lat, clusters[i].center.lon,
          clusters[j].center.lat, clusters[j].center.lon
        );

        if (distance < minDistance) {
          minDistance = distance;
          mergeIndices = [i, j];
        }
      }
    }

    // Stop if minimum distance exceeds threshold
    if (minDistance > threshold) {
      break;
    }

    // Merge clusters
    const [i, j] = mergeIndices;
    const cluster1 = clusters[i];
    const cluster2 = clusters[j];

    const mergedPoints = [...cluster1.points, ...cluster2.points];
    const newCenter = {
      lat: mergedPoints.reduce((sum, p) => sum + p.lat, 0) / mergedPoints.length,
      lon: mergedPoints.reduce((sum, p) => sum + p.lon, 0) / mergedPoints.length
    };

    const newCluster = {
      id: clusters.length,
      points: mergedPoints,
      center: newCenter
    };

    dendrogram.push({
      cluster1: cluster1.id,
      cluster2: cluster2.id,
      distance: minDistance,
      newCluster: newCluster.id
    });

    // Remove merged clusters and add new cluster
    clusters = clusters.filter((_, index) => index !== i && index !== j);
    clusters.push(newCluster);
  }

  // Convert to final format
  const finalClusters = {};
  clusters.forEach((cluster, index) => {
    finalClusters[index] = cluster.points.map(p => p.digipin);
  });

  return {
    clusters: finalClusters,
    dendrogram,
    threshold
  };
}

/**
 * Grid-based clustering using DIGIPIN precision levels
 * @param {Array<string>} digipins - Array of DIGIPIN codes
 * @param {number} precision - Clustering precision level
 * @returns {Object} Grid-based clustering result
 */
function gridBasedClustering(digipins, precision = 6) {
  const clusters = {};

  digipins.forEach(digipin => {
    // Truncate to clustering precision
    const cleanPin = digipin.replace(/-/g, '');
    const clusterKey = cleanPin.substring(0, precision);

    if (!clusters[clusterKey]) {
      clusters[clusterKey] = [];
    }
    clusters[clusterKey].push(digipin);
  });

  return {
    clusters,
    clusterCount: Object.keys(clusters).length,
    precision
  };
}

module.exports = {
  kMeansClustering,
  dbscanClustering,
  hierarchicalClustering,
  gridBasedClustering
};