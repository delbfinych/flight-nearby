window.onload = function() {
    let table = document.querySelector("table");
    let tbody = document.createElement("tbody");
    tbody.classList.add("table_data");
    table.appendChild(tbody);

    fetchData();
};

function fetchData() {
    fetch(
        "https://cors-anywhere.herokuapp.com/http://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48"
    )
        .then(res => res.json())
        .then(res => {
            let { full_count, version, ...data } = res; // Избавляемся от лишних данных перед перебором
            updateTable(data);
            setTimeout(fetchData,4000);
        });
}
function updateTable(data) {
    let tbody = document.querySelector(".table_data");
    let rows_number = tbody.childNodes.length;

    if (rows_number) for (let i = 0; i < rows_number; i++) tbody.deleteRow(0);

    let sortedData = sort(data);
    sortedData.forEach(item => {
        let tr = document.createElement("tr");
		
		item.forEach(el=>{
			fill_cell(el, tr);
		});

        tbody.appendChild(tr);
    });
}

function sort(data) {
    let result = [];

    // Берем только нужные для отображения элементы
    for (let item in data) {
        let latitude = data[item][1],
            longitude = data[item][2],
            track = data[item][3],
            altitude = Math.round(data[item][4] * 0.3048), // ft -> m
            speed = Math.round(data[item][5] * 1.852), // kts -> km/h
            departure = data[item][11],
            destination = data[item][12],
            flight = data[item][13];

        result.push([
            latitude,
            longitude,
            speed + " км/ч",
            track + "&deg;",
            altitude + " м",
            departure,
            destination,
            flight
        ]);
    }

    return result.sort((a, b) => {
        let aDistance = getDistanceBetween(a[0], a[1], 55.410307, 37.902451);
        let bDistance = getDistanceBetween(b[0], b[1], 55.410307, 37.902451);
        return aDistance - bDistance;
    });
}

function fill_cell(data, parent) {
    let td = document.createElement("td");
    td.innerHTML = `<b>${data}</b>`;
    parent.appendChild(td);
}

function getDistanceBetween(src_lat, src_lon, dest_lat, dest_lon) {
    return (
        6371 *
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(
					Math.sin(((src_lat - Math.abs(dest_lat)) * Math.PI) / 180) / 2, 2) 
				+
                Math.cos(
				    (src_lat * Math.PI) / 180)
				*
                Math.cos(
				    (Math.abs(dest_lat) * Math.PI) / 180)
				*
                Math.pow(
					Math.sin(((src_lon - dest_lon) * Math.PI) / 180) /2, 2)
            )
        )
    );
}
