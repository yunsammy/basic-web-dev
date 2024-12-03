import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const googleMapElement = document.getElementById("google-map");

function drawPolyline(map, pathCoordinates) {
  const polyline = new google.maps.Polyline({
    path: pathCoordinates,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  polyline.setMap(map);
}

function generateInfoWindowContent(hop) {
  return `
    <div>
      <h3>Hop ${hop.hopNumber}</h3>
      <p><strong>IP:</strong> ${hop.ip}</p>
      <p><strong>Location:</strong> ${hop.location.city}, ${hop.location.region}, ${hop.location.country}</p>
      <p><strong>Latitude:</strong> ${hop.location.latitude}</p>
      <p><strong>Longitude:</strong> ${hop.location.longitude}</p>
      <p><strong>Timezone:</strong> ${hop.timezone}</p>
      <p><strong>ISP:</strong> ${hop.isp}</p>
    </div>
    </div>
  `;
}

function createMarker(map, hop, onClick) {
  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: {
      lat: hop.location.latitude,
      lng: hop.location.longitude,
    },
    map,
    title: `Hop ${hop.hopNumber}`,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: generateInfoWindowContent(hop),
    disableAutoPan: true,
  });

  // Marker 클릭 이벤트
  marker.addListener("click", () => {
    console.log(`Marker clicked: Hop ${hop.hopNumber}`);
    infoWindow.open(map, marker);
    onClick(infoWindow);
  });

  return marker;
}

function initializeMap(center) {
  return new google.maps.Map(googleMapElement, {
    center: {
      lat: center.latitude,
      lng: center.longitude,
    },
    zoom: 8,
    mapId: "9099c80d42559508",
    disableDefaultUI: true,
    zoomControl: false,
  });
}

async function visualizeHopsOnMap(hops, apiKey) {
  const GoogleMapsApiKey = apiKey;

  const loader = new Loader({
    apiKey: GoogleMapsApiKey,
    version: "weekly",
    libraries: ["marker"],
  });

  loader.load().then(() => {
    console.log(hops);
    const map = initializeMap(hops[0].location);

    const pathCoordinates = [];
    const markers = [];
    let currentInfoWindow = null;

    // 홉 데이터 처리
    hops.forEach((hop) => {
      const marker = createMarker(map, hop, (infoWindow) => {
        // 새로운 window 클릭 시 이전 InfoWindow 닫기
        if (currentInfoWindow) currentInfoWindow.close();

        currentInfoWindow = infoWindow;
      });

      markers.push(marker);

      // 경로 좌표 추가
      pathCoordinates.push({
        lat: hop.location.latitude,
        lng: hop.location.longitude,
      });
    });

    // 경로 연결
    drawPolyline(map, pathCoordinates);

    // Marker Clusterer 생성
    new MarkerClusterer({ markers, map });

    // 지도 클릭 시 InfoWindow 닫기
    map.addListener("click", () => {
      if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null;
      }
    });
  });
}

// extension_page(index)의 메시지 수신
window.addEventListener("message", (event) => {
  console.log(event.data);
  visualizeHopsOnMap(event.data.hops, event.data.apiKey);
});
