
function getCityWeather(userCity) {
fetch("https://api.openweathermap.org/data/2.5/weather?q="+ userCity +"&appid=1a917358c02b3e63d3ca8a69be818363")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
        console.log(data);
  });
}
getCityWeather("Atlanta")

