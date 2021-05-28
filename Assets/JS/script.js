// Creating an empty array to which searched cities can be pushed to for saving to local storage.
let searchedCityArray = [];

// Creating empty arrays to which 5-day forecast data can be pushed and iterated over for rendering the 5-day forecast to site
let dailyTempArray = [];
let dailyHumidityArray = [];
let dailyWindArray = [];
let dailyIconArray = [];

// Creating variables to select HTML elements on the page, in which data can be rendered
let $searchForm = $('form');
let $cityName = $('#city-name');
let $currDate = $('#current-date');
let $currIcon = $('#current-icon');
let $currTemp = $('#current-temp');
let $currWind = $('#current-wind');
let $currHumidity = $('#current-humidity');
let $currUV = $('#current-uv');
let $forecastDays = $('.forecast-days');
let $forecastTemps = $('.forecast-days .forecast-temps');
let $forecastWinds = $('.forecast-days .forecast-winds');
let $forecastHumiditys = $('.forecast-days .forecast-humiditys');
let $forecastIcons = $('.forecast-days .forecast-icons');

// Generating the current date and dates of the 5-day forecast
let currentDate = moment().format('L');
let forecastDay1 = moment(currentDate,"L").add(1, "days").format("L");
let forecastDay2 = moment(currentDate,"L").add(2, "days").format("L");
let forecastDay3 = moment(currentDate,"L").add(3, "days").format("L");
let forecastDay4 = moment(currentDate,"L").add(4, "days").format("L");
let forecastDay5 = moment(currentDate,"L").add(5, "days").format("L");

// Rendering the current date and 5-day forecast dates to the site on page load
function renderDates() {
    $currDate.text(currentDate);
    $('#date1').text(forecastDay1);
    $('#date2').text(forecastDay2);
    $('#date3').text(forecastDay3);
    $('#date4').text(forecastDay4);
    $('#date5').text(forecastDay5);
};
renderDates();

// When the user submits their city in the search form input...
$searchForm.submit(function(event) {
    // ...prevent the default form submission behavior...
    event.preventDefault();
    // ...pull the user's input value
    let userInput = event.currentTarget[0].value;
    // ...if the user submitted without entering a city, stop running the function...
    if(!userInput) {
        return
    }
    //...otherwise, run the getCityWeather function using the user's input city...
    getCityWeather(userInput);
    // ...and reset the input field to blank.
    $('input').val("");
});

// Creating a function that renders the user's input city to the page...
function getCityWeather(userCity) {
    // First, use user's input city to fetch the Current Weather API data...
    fetch("https://api.openweathermap.org/data/2.5/weather?q="+ userCity +"&appid=1a917358c02b3e63d3ca8a69be818363")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Pulling the latitude and longitude coordinates and formatted city name from the API data
            let longitude = data.coord.lon;
            let latitude = data.coord.lat;
            let city = data.name;
            
            // Checking if the searched city has already been searched for (and therefore is in the array of searched cities)...
            if($.inArray(city,searchedCityArray) < 0) {
                // ...if the city is a new search, push the city to the array of searched cities to eventually save to local storage
                searchedCityArray.push(city);
                // ...then add the searched city as a button to page under the list of previous searches
                let newCityListItem = $('<li>');
                let newCity = $('<button>');
                newCity.text(city);
                $('ul').append(newCityListItem);
                newCityListItem.append(newCity);
                // ....when the newly created button is clicked, it will generate the weather data for that city
                newCity.click(function(event) {
                    console.log(event);
                    getCityWeather(event.target.innerText);
                })
            }
        
            // Run the function to store the array of searched cities to local storage
            storeCity();
            
            // Render the searched city to the page in the forecast
            $cityName.text(city);

            // Use the pulled latitude and longitudes for the user's input city to fetch One Call API data
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat="+latitude+"&lon="+longitude+"&units=imperial&appid=1a917358c02b3e63d3ca8a69be818363")
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    // Pulling current temperature, wind, humidity, UV data for the city
                    let currTemp = data.current.temp;
                    let currWind = data.current.wind_speed;
                    let currHumidity = data.current.humidity;
                    let currUVI = data.current.uvi;
                    // Pulling the current conditions icon from the data and embedding it in a URL source so it can render to page
                    let currIcon = data.current.weather[0].icon;
                    let currIconURL = "http://openweathermap.org/img/wn/"+currIcon+".png";

                    // Rendering the current weather data to page
                    $currIcon.attr('src',currIconURL);
                    $currTemp.text("  " + currTemp + " °F");
                    $currWind.text("  " + currWind + " MPH");
                    $currHumidity.text("  " + currHumidity + " %");
                    $currUV.text("  " + currUVI);

                    // Conditional formatting of UV Index for low, moderate, high, very-high and extreme.
                    // UVI range values sourced from https://www.epa.gov/sites/production/files/documents/uviguide.pdf
                    if(currUVI < 3) {
                        $currUV.attr('class','low-uv')
                    } else if (currUVI >= 3 && currUVI < 5) {
                        $currUV.attr('class','moderate-uv');
                    } else if (currUVI >= 5 && currUVI < 7) {
                        $currUV.attr('class','high-uv');
                    } else if (currUVI >= 7 && currUVI < 9) {
                        $currUV.attr('class','veryhigh-uv');
                    } else ($currUV.attr('class','extreme-uv'));

                    // Pulling the temp, humidity, wind, and icon for the next 5 days and rendering to page
                    let daily = data.daily;
                    for(i=0; i<5; i++) {
                        let dailyTemp = daily[i].temp.day;
                        $forecastTemps[i].textContent = "Temp: " + dailyTemp + " °F";
                        dailyTempArray.push(dailyTemp);
                        let dailyHumidity = daily[i].humidity;
                        $forecastHumiditys[i].textContent = "Humidity: " + dailyHumidity + " %";
                        dailyHumidityArray.push(dailyHumidity);
                        let dailyWind = daily[i].wind_speed;
                        $forecastWinds[i].textContent = "Wind: " + dailyWind + " MPH";
                        dailyWindArray.push(dailyWind);
                        let dailyIcon = daily[i].weather[0].icon;
                        let dailyIconURL = "http://openweathermap.org/img/wn/"+dailyIcon+".png";
                        $forecastIcons[i].setAttribute("src",dailyIconURL);
                        dailyIconArray.push(dailyIcon);
                    } 
                });
        });
}

// Creating a function to store an array of searched cities to local storage
function storeCity() {
    localStorage.setItem("city-name", JSON.stringify(searchedCityArray));
}

// Creating a function to render the saved cities to the page
function renderSavedCities() {
    let storedCities = JSON.parse(localStorage.getItem("city-name"));

    // If there are cities saved to local storage, set the array of searched cities to those
    if(storedCities) {
        searchedCityArray = storedCities;
        
        // For each previously searched city saved in local storage, render it to the page as a button in a list
        for (let i=0; i < storedCities.length; i++) {
            let searchedCityLI = $('<li>')
            let searchedCityBtn = $('<button>').text(searchedCityArray[i]);
            $('ul').append(searchedCityLI);
            searchedCityLI.append(searchedCityBtn);
            searchedCityBtn.attr('value',searchedCityArray[i]);
            searchedCityBtn.addClass('searchedCityBtn');
        }
    }
}
// Show any saved city searches upon page load
renderSavedCities()

// When any of the previously searched cities' buttons are clicked, fetch and render the weather data for that city
$('.searchedCityBtn').click(function(event) {
        getCityWeather(event.target.value);
});

// Creating a button that allows the user to clear the list of previously searched cities (which will clear local storage)
$('#clearSearchDiv button').click(function() {
    $('ul li').hide();
    localStorage.clear();
    searchedCityArray = [];
});
