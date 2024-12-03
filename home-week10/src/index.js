import axios from "axios";

const mainElement = document.getElementsByTagName("main")[0];
const formSectionElement = document.getElementById("form-section");
const traceRouteFormElement = document.getElementById("traceroute-form");
const apiKeyInputContainer = document.getElementById("api-key-input-container");
const perfOpsApiKeyInput = document.getElementById("perfops-api-key");
const abstractApiKeyInput = document.getElementById("abstract-api-key");
const googleMapsApiKeyInput = document.getElementById("google-maps-api-key");
const submitApiKeyButton = document.getElementById("submit-api-keys");
const locationInputContainer = document.getElementById(
  "location-input-container"
);
const locationInputElements = document.querySelectorAll(
  "#location-input-container input"
);
const submitLocationButtonElement = document.getElementById(
  "submit-start-location"
);
const loadingSectionElement = document.getElementById("loading-section");
const resultSectionElement = document.querySelector(".result-section");
const googleMapFrame = document.getElementById("google-map-iframe");
const tracerouteOutputElement = document.getElementById("traceroute-output");

const locationInputElementsPlaceholders = Array.from(locationInputElements).map(
  (input) => input.placeholder
);

// 전체 Traceroute output 위치 정보 포함하여 formatting
function formatTracerouteOutput(hops) {
  let output = "";

  // 각 hop 데이터를 줄바꿈하여 추가
  hops.forEach((hop) => {
    const rtt = hop.rtt !== null ? `${hop.rtt} ms` : "N/A";
    const location = `${hop.location.city}, ${hop.location.region}, ${hop.location.country}`;
    const isp = hop.isp;
    const timezone = hop.timezone;

    // 한 줄 형식: "hopNumber  ip (RTT) [Location | ISP | Timezone]"
    output += `\n\n${hop.hopNumber}  ${hop.ip} (${rtt}) [${location} | ISP: ${isp} | Timezone: ${timezone}]`;
  });

  return output;
}

// hop의 ip이용해 위치 정보 업데이트(ip-api)
async function updateHopsWithIpData(hops) {
  const API_URL =
    "http://ip-api.com/batch?fields=status,country,regionName,city,lat,lon,timezone,isp,query";

  // 내 IP 정보를 가져오기
  const sourceResponse = await axios.get("http://ip-api.com/json/");
  const sourceData = sourceResponse.data;
  console.log(`내 ip: ${sourceData.query}`);

  // 소스 정보를 구조화
  const sourceHop = {
    hopNumber: 0, // Source는 0번 홉으로 설정
    ip: sourceData.query,
    rtt: null, // RTT는 알 수 없으므로 null로 설정
    location: {
      country: sourceData.country,
      region: sourceData.regionName,
      city: sourceData.city,
      latitude: sourceData.lat,
      longitude: sourceData.lon,
    },
    timezone: sourceData.timezone,
    isp: sourceData.isp,
  };

  // hops 배열에서 IP 주소만 추출
  const ipAddresses = hops.map((hop) => ({ query: hop.ip }));

  // axios를 사용해 POST 요청
  const response = await axios.post(API_URL, ipAddresses);

  // 기존 hops에 응답 데이터를 매핑
  const updatedHops = hops
    .map((hop, index) => {
      const data = response.data[index];

      // 응답 데이터를 hop에 추가
      return {
        ...hop,
        location: {
          country: data.country,
          region: data.regionName,
          city: data.city,
          latitude: data.lat,
          longitude: data.lon,
        },
        timezone: data.timezone,
        isp: data.isp,
      };
    })
    .filter(
      (hop) =>
        hop.location.latitude !== undefined &&
        hop.location.longitude !== undefined
    ); // 위도와 경도가 정의되지 않은 홉 제거

  return [sourceHop, ...updatedHops];
}

// parsing perfops traceroute result
function parseTracerouteData(data) {
  const hops = []; // 중간 홉 정보를 저장할 배열

  console.log(data);
  const output = data["items"][0]["result"]["output"];

  if (!output) {
    console.warn("Traceroute output not found.");
    return false;
  }

  // 목적지 IP 추출
  const destination = output.match(/\(([\d.]+)\)/)[1];

  const lines = output.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 홉 정보 파싱
    const hopMatch = line.match(/^\s*(\d+)\s+([\d.]+).*?([\d.]+)\s+ms/);
    if (hopMatch) {
      const hopIP = hopMatch[2];
      const hopRTT = parseFloat(hopMatch[3]);

      hops.push({
        hopNumber: parseInt(hopMatch[1], 10),
        ip: hopIP,
        rtt: hopRTT,
      });
    }
  }
  // 마지막 홉의 IP가 목적지 IP와 다른 경우에만 목적지를 추가
  if (!hops.length || hops[hops.length - 1].ip !== destination) {
    const lastHopNumber =
      hops.length > 0 ? hops[hops.length - 1].hopNumber + 1 : 1;

    hops.push({
      hopNumber: lastHopNumber,
      ip: destination,
      rtt: null, // 목적지 RTT는 알 수 없으므로 null로 설정
    });
  }

  return hops;
}

async function getCurrentTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.url;
}

// Fetch Traceroute Data
async function fetchTraceroute(location) {
  const apiKey = localStorage.getItem("PerfOpsApiKey");

  const targetUrl = await getCurrentTabUrl();
  const urlObject = new URL(targetUrl);

  console.log(urlObject.hostname);

  const idResponse = await axios.post(
    "https://api.perfops.net/run/traceroute",
    {
      target: urlObject.hostname,
      location: location,
      limit: "1",
      ipversion: 4,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
    }
  );

  const id = idResponse.data.id;

  let result;

  // traceroute 완료 될 때까지 대기
  while (true) {
    const response = await axios.get(
      `https://api.perfops.net/run/traceroute/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
      }
    );

    result = response.data;
    const finished = result.finished;

    // 완료되지 않았으면 0.5초 대기 후 다시 요청
    if (finished) {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return result;
}

async function handleTraceRouteSubmit(e) {
  e.preventDefault();

  let location;

  // 시작 위치 입력 값 가져오기
  locationInputElements.forEach((input) => {
    if (input.value.trim() !== "") {
      location = input.value;
    }
  });

  try {
    formSectionElement.style.display = "none";
    loadingSectionElement.style.display = "flex";
    const tracerouteData = await fetchTraceroute(location);
    const parsedTracerouteData = parseTracerouteData(tracerouteData);
    const tracerouteWithLocation = await updateHopsWithIpData(
      parsedTracerouteData
    );
    googleMapFrame.contentWindow.postMessage(
      {
        action: "visualizeHops",
        hops: tracerouteWithLocation,
        apiKey: localStorage.getItem("GoogleMapsApiKey"),
      },
      "*"
    );
    const tracerouteOutput = tracerouteData["items"][0]["result"]["output"];
    const tracerouteOutputHeader = tracerouteOutput
      .split("\n")[0]
      .split(",")[0];
    const formattedOutput = formatTracerouteOutput(tracerouteWithLocation);
    console.log(tracerouteOutput);
    console.log(tracerouteOutputHeader);
    console.log(formattedOutput);
    tracerouteOutputElement.innerText = tracerouteOutputHeader;
    tracerouteOutputElement.innerText += formattedOutput;
    loadingSectionElement.style.display = "none";
    resultSectionElement.style.display = "flex";
  } catch (error) {
    formSectionElement.style.display = "none";
    loadingSectionElement.style.display = "none";
    googleMapFrame.style.display = "none";
    mainElement.innerText = `${error.message}`;
  }
}

function updateLocationInputStates() {
  // Find the location input field with non-empty
  const activeInput = Array.from(locationInputElements).find(
    (input) => input.value !== ""
  );

  // Enable or disable location inputs based on active input
  locationInputElements.forEach((inputElement, index) => {
    if (activeInput) {
      inputElement.placeholder = "you can input only one field";
      inputElement.disabled = inputElement !== activeInput; // Disable all except the active one
    } else {
      inputElement.placeholder = locationInputElementsPlaceholders[index];
      inputElement.disabled = false; // Re-enable all if no input has a value
    }
  });
}

function handleApiKeySubmit(e) {
  e.preventDefault();

  // 3개의 api key 값 가져오기
  const perfOpsApiKey = perfOpsApiKeyInput.value.trim();
  const abstractApiKey = abstractApiKeyInput.value.trim();
  const googleMapsApiKey = googleMapsApiKeyInput.value.trim();

  // 로컬 스토리지에 저장
  localStorage.setItem("PerfOpsApiKey", perfOpsApiKey);
  localStorage.setItem("AbstractApiKey", abstractApiKey);
  localStorage.setItem("GoogleMapsApiKey", googleMapsApiKey);

  apiKeyInputContainer.style.display = "none";
  locationInputContainer.style.display = "flex";
}

function init() {
  console.log(window.location.href);
  // set icon to be generic green
  // chrome.runtime.sendMessage({
  //   action: "updateIcon",
  //   value: {
  //     color: "green",
  //   },
  // });

  // get API Key from LocalStorage
  const storedPerfOpsApiKey = localStorage.getItem("PerfOpsApiKey");
  const storedAbstractApiKey = localStorage.getItem("AbstractApiKey");
  const storedGoogleMapsApiKey = localStorage.getItem("GoogleMapsApiKey");

  if (
    storedPerfOpsApiKey === null ||
    storedAbstractApiKey === null ||
    storedGoogleMapsApiKey == null
  ) {
    apiKeyInputContainer.style.display = "flex";
    submitApiKeyButton.addEventListener("click", handleApiKeySubmit);
  } else {
    apiKeyInputContainer.style.display = "none";
    locationInputContainer.style.display = "flex";
  }
}

traceRouteFormElement.addEventListener("submit", handleTraceRouteSubmit);
locationInputElements.forEach((inputElement) => {
  inputElement.addEventListener("input", updateLocationInputStates);
});

init();
