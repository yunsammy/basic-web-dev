import axios from "axios";

// form fields
const form = document.querySelector(".form-data");
const apiKey = document.querySelector(".api-key");
const regionElements = document.querySelectorAll(".region-name");
// results
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");
const clearBtn = document.querySelector(".clear-btn");
const myregions = document.querySelectorAll(".my-region");
const usages = document.querySelectorAll(".carbon-usage");
const fossilfuels = document.querySelectorAll(".fossil-fuel");

const calculateColor = async (value) => {
  let co2Scale = [0, 150, 600, 750, 800];
  let colors = ["#2AA364", "#F5EB4D", "#9E4229", "#381D02", "#381D02"];
  let closestNum = co2Scale.sort((a, b) => {
    return Math.abs(a - value) - Math.abs(b - value);
  })[0];
  console.log(value + " is closest to " + closestNum);
  let num = (element) => element > closestNum;
  let scaleIndex = co2Scale.findIndex(num);
  let closestColor = colors[scaleIndex];
  console.log(scaleIndex, closestColor);
  chrome.runtime.sendMessage({
    action: "updateIcon",
    value: { color: closestColor },
  });
};

const displayCarbonUsage = async (apiKey, regionNames) => {
  try {
    const requests = regionNames.map((regionName) =>
      axios.get("https://api.co2signal.com/v1/latest", {
        params: {
          countryCode: regionName,
        },
        headers: {
          //please get your own token from CO2Signal https://www.co2signal.com/
          "auth-token": apiKey,
        },
      })
    );

    const responses = await Promise.all(requests);

    loading.style.display = "none";
    form.style.display = "none";

    responses.forEach((response, index) => {
      let CO2 = Math.floor(response.data.data.carbonIntensity);
      calculateColor(CO2);
      myregions[index].textContent = regionNames[index];
      usages[index].textContent =
        Math.round(response.data.data.carbonIntensity) +
        " grams (grams C02 emitted per kilowatt hour)";
      fossilfuels[index].textContent =
        response.data.data.fossilFuelPercentage.toFixed(2) +
        "% (percentage of fossil fuels used to generate electricity)";
      results.style.display = "block";
    });
  } catch (error) {
    console.log(error);
    loading.style.display = "none";
    results.style.display = "none";
    errors.textContent =
      "Sorry, we have no data for the region you have requested.";
  }
};

function setUpUser(apiKey, regionNames) {
  localStorage.setItem("apiKey", apiKey);
  localStorage.setItem("regionNames", JSON.stringify(regionNames));
  loading.style.display = "block";
  errors.textContent = "";
  clearBtn.style.display = "block";
  displayCarbonUsage(apiKey, regionNames);
}

function handleSubmit(e) {
  e.preventDefault();
  const regionNames = Array.from(regionElements).map((region) => region.value);
  setUpUser(apiKey.value, regionNames);
}

function init() {
  const storedApiKey = localStorage.getItem("apiKey");
  const storedRegionNames = JSON.parse(localStorage.getItem("regionNames"));
  //set icon to be generic green
  chrome.runtime.sendMessage({
    action: "updateIcon",
    value: {
      color: "green",
    },
  });
  if (storedApiKey === null || storedRegionNames === null) {
    form.style.display = "block";
    results.style.display = "none";
    loading.style.display = "none";
    clearBtn.style.display = "none";
    errors.textContent = "";
  } else {
    displayCarbonUsage(storedApiKey, storedRegionNames);
    results.style.display = "none";
    form.style.display = "none";
    clearBtn.style.display = "block";
  }
}

function reset(e) {
  e.preventDefault();
  localStorage.removeItem("regionNames");
  init();
}

form.addEventListener("submit", (e) => handleSubmit(e));
clearBtn.addEventListener("click", (e) => reset(e));
init();
