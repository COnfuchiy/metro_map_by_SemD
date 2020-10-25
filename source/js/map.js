/**
 * Created by Dima on 25.10.2020.
 */

class Navigation {
    constructor() {
        this.graph = new Graph(graph_matrix_one_empty_line);
        this.scale = 1.0;
        this.map_svg = $('svg')[0];
        this.selected_station = [];
        this.last_path_stations = [];
        this.last_path_station_data = [];
        this.stations = $('circle');
        this.stations_names = $('text');
        this.pahts = $('path');
    }

    get_current_translate_attr() {
        let cur_attr = this.map_svg.getAttribute('transform');
        let cur_trans = cur_attr.slice(cur_attr.indexOf('translate(') + 10, $('svg')[0].getAttribute('transform').length - 1);
        return cur_trans.split(',');
    }

    map_opacity_change(value) {
        this.stations.each(function () {
            this.setAttribute('opacity', value.toString());
        });
        this.pahts.each(function () {
            this.setAttribute('opacity', value.toString());
        });
        this.stations_names.each(function () {
            this.setAttribute('opacity', value.toString());
        });
    }

    view_path(stations) {
        this.map_opacity_change(0.2);
        for (let index of stations) {
            this.last_path_station_data[index] = {
                r: this.stations[index].getAttribute("r"),
                color: this.stations[index].getAttribute("fill"),
                text_color: this.stations_names[this.graph.get_text_index(index)].getAttribute('fill')
            };
            this.stations[index].setAttribute("r", "6");
            this.stations[index].setAttribute("fill", $('circle')[index].getAttribute("stroke"));
            this.stations[index].setAttribute('opacity', "1");
            this.stations_names[this.graph.get_text_index(index)].setAttribute('opacity', "1");
            this.stations_names[this.graph.get_text_index(index)].setAttribute('fill', $('circle')[index].getAttribute("stroke"));
        }
        this.map_svg.setAttribute('transform', 'scale(' + this.scale + ') translate(' + 0 + ',' + 0 + ')');
    }

    create_path_about(data) {
        $('.path-buttons-area').append(`
            <a class="clear-map" onclick="document.nav.discharge_stations()">Очистить</a>
        `);
        $('.path-about-area').append(`<p>Маршрут: ` + data.distance + `</p>`);
        let weights = data.weights.split('->');
        for (let i = 1; i < weights.length - 1; i++) {
            $('.path-about-area').append(`
            <div class="one-path">` + this.graph.station_name(this.last_path_stations[i - 1]) + `→` + this.graph.station_name(this.last_path_stations[i]) +
                `<br>`
                + (weights[i] - weights[i - 1]) + `</div>
        `);
        }
    }

    discharge_stations() {
        for (let index of this.last_path_stations) {
            this.stations[index].setAttribute("r", this.last_path_station_data[index].r);
            this.stations[index].setAttribute("fill", this.last_path_station_data[index].color);
            this.stations_names[this.graph.get_text_index(index)].setAttribute('fill', this.last_path_station_data[index].text_color);
        }
        this.map_opacity_change(1);
        this.last_path_station_data = [];
        this.last_path_stations = [];
        $('.path-about-area').empty();
        $('.path-buttons-area').empty();
        $('.first_point_input')[0].value = '';
        $('.second_point_input')[0].value = '';
    }

    middle_station() {
        document.nav.selected_station[0] = 9;
        $('.first_point_input')[0].value = document.nav.graph.station_name(9);
        if (!$('.second_point_input')[0].value)
            $('.second_point_input').focus();
        else
            document.nav.calculate_path();
    }

    all_middle_station() {
        let path_data = this.graph.search_all_shortest_path(9, 172, '');
        $('.path-buttons-area').append(`
            <a class="clear-map" onclick="$('.path-about-area').empty();">Очистить</a>
        `);
        for (let i = 1; i < path_data.distance.length - 1; i++)
            if (path_data.distance[i] !== 0 && i!==37 && i!==63)
                $('.path-about-area').append(`
            <div class="one-path">` + this.graph.station_name(9) + `→` + this.graph.station_name(i) +
                    `=`
                    + (path_data.distance[i]) + `</div>
        `);
    }

    scale_map(direction) {
        if (direction < 0) {
            if (this.scale < 2.5)
                this.scale += 0.1;
        }
        else if (this.scale > 1)
            this.scale -= 0.1;

        let cur_attr = this.get_current_translate_attr();
        this.map_svg.setAttribute('transform', 'scale(' + this.scale + ') translate(' + cur_attr[0] + ',' + cur_attr[1] + ')');
    }

    map_drag(deltaX, deltaY) {
        let cur_attr = this.get_current_translate_attr();
        this.map_svg.setAttribute('transform', 'scale(' + this.scale + ') translate(' + ((parseInt(cur_attr[0]) + deltaX / this.scale)) + ',' + ((parseInt(cur_attr[1]) + deltaY / this.scale)) + ')');
    }


    calculate_path() {
        let path_data = this.graph.search_shortest_path(this.selected_station[0], this.selected_station[1], '');
        let stations = path_data.path.split('->');
        this.last_path_stations = stations.splice(0, stations.length - 1);
        this.view_path(this.last_path_stations);
        this.create_path_about(path_data);

    }
}

$(document).ready(function () {
    document.nav = new Navigation();
    $('.first_point_input').focus();
    $('circle').each(function () {
        $(this).on('mousedown', function () {
            return false;
        });
        $(this).on('click', function () {
            if ($('.first_point_input').is(":focus")) {
                document.nav.selected_station[0] = $('circle').index(this);
                $('.first_point_input')[0].value = document.nav.graph.station_name($('circle').index(this));
                if (!$('.second_point_input')[0].value)
                    $('.second_point_input').focus();
                else
                    document.nav.calculate_path();
            }
            else if ($('.second_point_input').is(":focus")) {
                document.nav.selected_station[1] = $('circle').index(this);
                $('.second_point_input')[0].value = document.nav.graph.station_name($('circle').index(this));
                if ($('.first_point_input')[0].value) {
                    $('.second_point_input').blur();
                    document.nav.calculate_path();
                }
                else
                    $('.first_point_input').focus();
            }

        });

    });
    // $(".sidebar").on('wheel', function (e) {
    //
    //     return false;
    // });
    $(".main_map").on('wheel', function (e) {
        document.nav.scale_map(e.originalEvent.deltaY);
        return false;
    });
    $(".main_map").on('mousedown', function (event) {


        function onMouseMove(event) {
            document.nav.map_drag(event.movementX, event.movementY);
        }

        document.addEventListener('mousemove', onMouseMove);

        $(".main_map").on("mouseup", function () {
            document.removeEventListener('mousemove', onMouseMove);
            $(".main_map")[0].onmouseup = null;
        });

    }).on("dragstart", function () {
        return false;
    });
});