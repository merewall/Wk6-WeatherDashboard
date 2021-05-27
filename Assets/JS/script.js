// let currWeatherArray = [];
let searchedCityArray = [];
let lastSearchIndex = (searchedCityArray.length - 1)
let dailyTempArray = [];
let dailyHumidityArray = [];
let dailyWindArray = [];
let dailyIconArray = [];
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
let currentDate = moment().format('L');
let forecastDay1 = moment(currentDate,"L").add(1, "days").format("L");
let forecastDay2 = moment(currentDate,"L").add(2, "days").format("L");
let forecastDay3 = moment(currentDate,"L").add(3, "days").format("L");
let forecastDay4 = moment(currentDate,"L").add(4, "days").format("L");
let forecastDay5 = moment(currentDate,"L").add(5, "days").format("L");

function renderDates() {
    $currDate.text(currentDate);
    $('#date1').text(forecastDay1);
    $('#date2').text(forecastDay2);
    $('#date3').text(forecastDay3);
    $('#date4').text(forecastDay4);
    $('#date5').text(forecastDay5);
};
renderDates();

$searchForm.submit(function(event) {
    event.preventDefault();
    let userInput = event.currentTarget[0].value;
    if(!userInput) {
        return
    }
    getCityWeather(userInput);
    $('input').val("");
});

function getCityWeather(userCity) {
fetch("https://api.openweathermap.org/data/2.5/weather?q="+ userCity +"&appid=1a917358c02b3e63d3ca8a69be818363")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
        let longitude = data.coord.lon;
        let latitude = data.coord.lat;
        let city = data.name;
        if($.inArray(city,searchedCityArray) < 0) {
            searchedCityArray.push(city);
            let newCityListItem = $('<li>');
            let newCity = $('<button>');
            newCity.text(city);
            $('ul').append(newCityListItem);
            newCityListItem.append(newCity);
            newCity.click(function(event) {
                console.log(event);
                getCityWeather(event.target.innerText);
            })
        }
        
        storeCity();
        
        $cityName.text(city);

        fetch("https://api.openweathermap.org/data/2.5/onecall?lat="+latitude+"&lon="+longitude+"&units=imperial&appid=1a917358c02b3e63d3ca8a69be818363")
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                let currTemp = data.current.temp;
                let currWind = data.current.wind_speed;
                let currHumidity = data.current.humidity;
                let currUVI = data.current.uvi;
                let currIcon = data.current.weather[0].icon;
                let currIconURL = "http://openweathermap.org/img/wn/"+currIcon+".png";
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

                $currIcon.attr('src',currIconURL);
                $currTemp.text("  " + currTemp + " °F");
                $currWind.text("  " + currWind + " MPH");
                $currHumidity.text("  " + currHumidity + " %");
                $currUV.text("  " + currUVI);
                // CREATE IF STATEMENT TO STYLE UV COLOR
                if(currUVI < 3) {
                    $currUV.attr('class','low-uv')
                } else if (currUVI >= 3 && currUVI < 5) {
                    $currUV.attr('class','moderate-uv');
                } else if (currUVI >= 5 && currUVI < 7) {
                    $currUV.attr('class','high-uv');
                } else if (currUVI >= 7 && currUVI < 9) {
                    $currUV.attr('class','veryhigh-uv');
                } else ($currUV.attr('class','extreme-uv'));


                // might just need the city name to save to local storage and then push it through as the variable
                // let cityWeather = {
                //     cityName: city,
                //     // cityIcon: currIcon,
                //     // cityTemp: currTemp,
                //     // cityWind: currWind,
                //     // cityHumidity: currHumidity,
                //     // cityUVI: currUVI,
                //     // fiveDayTemp: dailyTempArray,
                //     // fiveDayWind: dailyWindArray,
                //     // fiveDayHumidity: dailyHumidityArray,
                //     // fiveDayIcon: dailyIconArray
                // }
                // currWeatherArray.push(cityWeather);
                // console.log(currWeatherArray);
                


            });
  });
}
// getCityWeather("atlanta");

// $('.newSearchedCityBtn').click(getCityWeather(searchedCityArray[lastSearchIndex]));

// submit event listener (make a form so enter is captured)
// add get City Weather function which renders data to page
// add storing city name
// create list item with button type and append to ul under form

// Creating a function to store an array of city weather data to local storage
function storeCity() {
    localStorage.setItem("city-name", JSON.stringify(searchedCityArray));
}

function renderSavedCities() {
    let storedCities = JSON.parse(localStorage.getItem("city-name"));

    if(storedCities) {
        searchedCityArray = storedCities;
        
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
renderSavedCities()

// add getItem function for pulling from local storage on page load
// .....add rendering city names as list item buttons

// add click listeners for all list item buttons that take name and input it into getCityWeather function as the input
$('.searchedCityBtn').click(function(event) {
    // console.log(event);
    getCityWeather(event.target.value);
});

// $('.latestSearchCity').click(function(event) {
//     console.log(event);
//     getCityWeather(event.target.value);
// });

// function handleNewCityClick() {
//     console.log(event);
//     getCityWeather(event.target.value);


// create a button to clear history
$('#clearSearchDiv button').click(function() {
    $('ul li').hide();
    // $('#clearSearchDiv').hide();
    localStorage.clear();
    // location.reload();
    searchedCityArray = [];
});

// on page load set input value to Atlanta, then have submit event override it



// UV Index conditional styling
