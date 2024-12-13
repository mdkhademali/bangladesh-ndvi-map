// Load the administrative boundary of Bangladesh
var bangladesh = ee.FeatureCollection("FAO/GAUL/2015/level0")
                    .filter(ee.Filter.eq('ADM0_NAME', 'Bangladesh'));

// Center the map on Bangladesh
Map.centerObject(bangladesh, 7);

// Add the boundary to the map
Map.addLayer(bangladesh, {color: 'red'}, 'Bangladesh Boundary');

// Load Landsat-8 Surface Reflectance data
var landsat = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                .filterDate('2023-01-01', '2023-12-31') // Specify the time range
                .filterBounds(bangladesh);

// Select necessary bands for NDVI calculation (NIR and Red)
var ndvi = landsat.map(function(image) {
  var nir = image.select('SR_B5'); // Near Infrared
  var red = image.select('SR_B4'); // Red
  var ndviImage = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  return image.addBands(ndviImage);
});

// Calculate the median NDVI over the year
var medianNDVI = ndvi.select('NDVI').median().clip(bangladesh);

// Define NDVI visualization parameters
var ndviVis = {
  min: 0,
  max: 1,
  palette: ['blue', 'white', 'green'] // Blue (low NDVI), Green (high NDVI)
};

// Add the median NDVI layer to the map
Map.addLayer(medianNDVI, ndviVis, 'Median NDVI');

// Optional: Export the NDVI image to Google Drive
Export.image.toDrive({
  image: medianNDVI,
  description: 'Bangladesh_Median_NDVI',
  region: bangladesh.geometry().bounds(),
  scale: 30, // Resolution in meters
  maxPixels: 1e13
});