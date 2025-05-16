const map = L.map('map').setView([20, 0], 2);

// Add map tile
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Load country shapes
fetch('countries.geo.json') // You can use a public GeoJSON file too
  .then(res => res.json())
  .then(data => {
    L.geoJson(data, {
      style: {
        color: "#666",
        weight: 1,
        fillOpacity: 0.3
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          highlightCountry(layer);
          fetchCountryInfo(feature.properties.ADMIN); // Country name
        });
      }
    }).addTo(map);
  });

let highlightedLayer = null;

function highlightCountry(layer) {
  if (highlightedLayer) {
    geojson.resetStyle(highlightedLayer);
  }
  highlightedLayer = layer;
  layer.setStyle({
    color: "black",
    weight: 3,
    fillOpacity: 0.5
  });
}

function fetchCountryInfo(name) {
  fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`)
    .then(res => res.json())
    .then(data => {
      const country = data[0];
      document.getElementById('info-box').innerHTML = `
        <strong>${country.name.common}</strong><br>
        Capital: ${country.capital?.[0] || 'N/A'}<br>
        Currency: ${Object.values(country.currencies || {})[0]?.name || 'N/A'}<br>
        <img class="flag" src="${country.flags.png}" />
      `;
    })
    .catch(() => {
      document.getElementById('info-box').innerHTML = `Info not found.`;
    });
}
