function makeInfoContent(carEntity) {
    return '<div class="infoWindow">' +
        '<span>' + carEntity.mark.title + '</span></br>' +
        '<span>' + carEntity.number + '</span></br>' +
        '<span>' + carEntity.fromplace + '</span></br>' +
        '<span>' + carEntity.date + '</span></br>' +
        '</div>'
}

var $totalCars = $('#totalCars');
function showCount(count) {
    $totalCars.html('<h5>Count: ' + count + '</h5>').show();
}
var colors = {
    hour: '#F5003D',
    day: '#CC0033',
    week: '#8E4848',
    longtime: '#616161'
};

function getActiveCars(map) {

    $.ajax({
        url: "/getActive"
    }).done(function (data) {
        var time = new Date().getTime();
        var mapObjects = [];
        for (var i = 0; i < data.length - 1; i++)
            if (data[i].hasOwnProperty("location") && data[i].location != null) {
                var markerColor;
                var timeDelta = (time - data[i].timestamp) / 1000;
                if (timeDelta < 2 * 60 * 60) markerColor = colors.hour;
                else if (timeDelta < 80 * 60 * 60) markerColor = colors.day;
                else if (timeDelta < 7 * 80 * 60 * 60) markerColor = colors.week;
                else markerColor = colors.longtime;

                var marker = new ymaps.Placemark([data[i].location.lat, data[i].location.lng],
                    {balloonContent: makeInfoContent(data[i]), car: data[i]}, {preset: 'islands#icon', iconColor: markerColor});
                mapObjects.push(marker);
            }
        map.geoObjects.removeAll(); //Clean all
        //ymaps.geoQuery(mapObjects).search('properties.car.mark.title="Ford"').addToMap(map);
        ymaps.geoQuery(mapObjects).addToMap(map);
        showCount(mapObjects.length);
    });

}

$(document).ready(function () {

    ymaps.ready(function () {
        var defaultZoom = 12;
        var mapState = {center: [45.033333, 38.966667], zoom: defaultZoom, controls: ['zoomControl']};
        var mapOptions = {
            minZoom: defaultZoom,
            maxZoom: 17,
            restrictMapArea: true
        };
        var myMap = new ymaps.Map("map-canvas", mapState, mapOptions);

        window.setTimeout(getActiveCars(myMap), 1000);
        var intervalID = window.setInterval(function () {
            getActiveCars(myMap);
        }, 60000);
    })

});
