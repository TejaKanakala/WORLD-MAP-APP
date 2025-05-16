// const map = L.map('map').setView([20, 0], 2);

// // Add OpenStreetMap tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 18
// }).addTo(map);

// let selectedLayer;
// let geoJsonLayer;

// // Load GeoJSON country borders
// fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
//   .then(res => res.json())
//   .then(geoData => {
//     geoJsonLayer = L.geoJson(geoData, {
//       style: {
//         color: "#666",
//         weight: 1,
//         fillOpacity: 0.2
//       },
//       onEachFeature: (feature, layer) => {
//         layer.on('click', () => {
//           highlightCountry(layer, feature.properties.name);
//         });
//       }
//     }).addTo(map);
//   });

// // Highlight and fetch info
// function highlightCountry(layer, countryName) {
//   if (selectedLayer) selectedLayer.setStyle({ color: "#666", weight: 1 });

//   selectedLayer = layer;
//   layer.setStyle({ color: "black", weight: 3 });

//   fetchCountryInfo(countryName);
// }

// // Fetch country info from REST Countries API
// function fetchCountryInfo(name) {
//   fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`)
//     .then(res => res.ok ? res.json() : Promise.reject('Not found'))
//     .then(data => {
//       const country = data[0];
//       document.getElementById('info-box').innerHTML = `
//         <strong>${country.name.common}</strong><br>
//         Capital: ${country.capital?.[0] || 'N/A'}<br>
//         Currency: ${Object.values(country.currencies || {})[0]?.name || 'N/A'}<br>
//         <img class="flag" src="${country.flags.png}" alt="Flag of ${country.name.common}" />
//       `;
//     })
//     .catch(() => {
//       document.getElementById('info-box').innerHTML = `No data found for "${name}".`;
//     });
// }

// // Search bar functionality
// document.getElementById('country-search').addEventListener('keypress', function (e) {
//   if (e.key === 'Enter') {
//     const searchTerm = this.value.trim().toLowerCase();
//     let found = false;

//     geoJsonLayer.eachLayer(layer => {
//       const name = layer.feature.properties.name.toLowerCase();
//       if (name === searchTerm) {
//         map.fitBounds(layer.getBounds());
//         highlightCountry(layer, layer.feature.properties.name);
//         found = true;
//       }
//     });

//     if (!found) {
//       document.getElementById('info-box').innerHTML = `Country "${this.value}" not found on map.`;
//     }
//   }
// });








const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

let selectedLayer;
let geoJsonLayer;
const countryList = [];
const nameFixes = {
  "usa": "United States",
  "us": "United States",
  "uk": "United Kingdom",
  "uae": "United Arab Emirates",
  "south korea": "Korea (Republic of)",
  "north korea": "Korea (Democratic People's Republic of)",
  "czech republic": "Czechia",
  "russia": "Russian Federation",
  "viet nam": "Vietnam",
  "ivory coast": "Côte d'Ivoire",
  "swaziland": "Eswatini"
};

function normalizeCountryInput(input) {
  const lower = input.toLowerCase();
  return nameFixes[lower] || input;
}

fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
  .then(res => res.json())
  .then(geoData => {
    geoJsonLayer = L.geoJson(geoData, {
      style: {
        color: "#666",
        weight: 1,
        fillOpacity: 0.2
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;
        countryList.push(name);
        layer.on('click', () => {
          highlightCountry(layer, name);
        });
      }
    }).addTo(map);

    // Add countries to datalist for autocomplete
    const datalist = document.getElementById("country-list");
    countryList.sort().forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
  });

function highlightCountry(layer, countryName) {
  if (selectedLayer) selectedLayer.setStyle({ color: "#666", weight: 1 });
  selectedLayer = layer;
  layer.setStyle({ color: "black", weight: 3 });
  fetchCountryInfo(countryName);
}

function fetchCountryInfo(name) {
  fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`)
    .then(res => res.ok ? res.json() : Promise.reject('Not found'))
    .then(data => {
      const country = data[0];
      document.getElementById('info-box').innerHTML = `
        <strong>${country.name.common}</strong><br>
        Capital: ${country.capital?.[0] || 'N/A'}<br>
        Currency: ${Object.values(country.currencies || {})[0]?.name || 'N/A'}<br>
        <img class="flag" src="${country.flags.png}" alt="Flag of ${country.name.common}" />
      `;
    })
    .catch(() => {
      document.getElementById('info-box').innerHTML = `No data found for "${name}".`;
    });
}

document.getElementById('country-search').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const rawInput = this.value.trim();
    const normalized = normalizeCountryInput(rawInput);
    let found = false;

    geoJsonLayer.eachLayer(layer => {
      const name = layer.feature.properties.name;
      if (name.toLowerCase() === normalized.toLowerCase()) {
        map.fitBounds(layer.getBounds());
        highlightCountry(layer, name);
        found = true;
      }
    });

    if (!found) {
      document.getElementById('info-box').innerHTML = `Country "${rawInput}" not found on map.`;
    }
  }
});
