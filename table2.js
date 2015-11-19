function table(data, w, h) {
    function numberDescSort(a, b) {
        return b.value - a.value;
    }

    function numberAscSort(a, b) {
        return a.value - b.value;
    }

    function wordDescSort(a, b) {
        return a.name.localeCompare(b.name);
    }

    function wordAscSort(b, a) {
        return a.name.localeCompare(b.name);
    }
    data = data.sort(wordDescSort);
    var sorted = "ABC";
    d3.select("thead td")
        .data(data)
        .on("click", function(k) {
            var sorter;
            switch(sorted) {
                case "321":
                    sorter = numberAscSort;
                    sorted = "123";
                    break;
                default:
                    sorter = numberDescSort;
                    sorted = "321";
                    break;
            }
            tr.sort(sorter).transition().duration(750);
        });
    d3.selectAll("thead th")
        .data(data)
        .on("click", function() {
            var sorter;
            switch(sorted) {
                case "ABC":
                    sorter = wordAscSort;
                    sorted = "CBA";
                    break;
                default:
                    sorter = wordDescSort;
                    sorted = "ABC";
                    break;
            }
            tr.sort(sorter).transition().duration(750);
        });

    var tr = d3.select("tbody").selectAll("tr")
        .data(data)
        .enter().append("tr");

    var max = data.reduce(function(prev, curr) {
        return prev > curr.value ? prev : curr.value;
    }, -1);

    tr.append("th")
        .text(function(d) { return d.name; });
    tr.append("td")
        .attr("class", "number")
        .text(function(d) { return d.value.toFixed(2); });
    tr.append("td")
        .append("svg").attr("width", "100%").attr("height", "100%")
        .append("rect")
        .attr("height", "100%")
        .attr("width", function(d) { return d.value/max * 100 + '%'; });

    return function(newData) {
        data = newData;

        var sorter;
        switch(sorted) {
            case "CBA":
                data = data.sort(wordAscSort);
                break;
            case "ABC":
                data = data.sort(wordDescSort);
                break;
            case "123":
                data = data.sort(numberAscSort);
                break;
            case "321":
                data = data.sort(numberDescSort);
                break;
        }
        var max = data.reduce(function(prev, curr) {
            return prev > curr.value ? prev : curr.value;
        }, -1);
        var tr = d3.select("tbody").selectAll("tr").data(data);
        tr = tr.transition().duration(750);

        var y = tr
            .select("th")
            .text(function(d) {
                return d.name;
            });
        tr.select("td")
            .text(function(d) { return d.value.toFixed(2); });
        tr
            .select("svg").select("rect")
            .attr("width", function(d) { return d.value/max * 100 + '%'; });

    }
}

