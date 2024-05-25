const totalLot = document.getElementById("total-lot");
const totalSalesPrice = document.getElementById("total-sales-price");
const tableData = document.getElementById("data-table");
const filterYearElement = document.getElementById("year");
const wrapperChart = document.getElementById("wrapper-chart");
const sortDataTable = document.getElementById("sort-data-table-sales-price");

sortDataTable.addEventListener("change", renderDataBySortDataTable);

const IDR = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fetchDataJson(year, sortDataTable="") {
  fetch("./data/data-tim-09.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const dataSlice = year
        ? data.filter((el) => el["SALE DATE"].split("-")[0] === year)
        : data;
      const dataSalesObject = {}; // { QUEENS: 1000, MANHATTAN: 2000, ...}

      for (let i = 0; i < dataSlice.length; i++) {
        if (dataSalesObject[dataSlice[i].BOROUGH]) {
          dataSalesObject[dataSlice[i].BOROUGH] += dataSlice[i]["SALE PRICE"];
        } else {
          dataSalesObject[dataSlice[i].BOROUGH] = dataSlice[i]["SALE PRICE"];
        }
      }

      const yearData = dataSlice.map((el) => Number(el["SALE DATE"].split("-")[0]));
      const yearDataMap = [...new Set(yearData)].sort((a,b)=> a-b);

      const totalLotData = dataSlice.reduce(
        (acc, curr) => acc + Number(curr["TOTAL UNITS"]),
        0
      );

      const totalSalesPriceData = dataSlice.reduce(
        (acc, curr) => acc + Number(curr["SALE PRICE"]),
        0
      );

      const formatTotalLot = totalLotData.toLocaleString();
      const formatTotalSales = IDR.format(totalSalesPriceData);

      totalLot.innerHTML = formatTotalLot;
      totalSalesPrice.innerHTML = formatTotalSales;

      if (
        !year &&
        filterYearElement.options.length <= yearDataMap.length
      ) {
        for (let i = 0; i < yearDataMap.length; i++) {
          const optionElement = document.createElement("option");
          optionElement.value = yearDataMap[i];
          optionElement.innerText = yearDataMap[i];
          filterYearElement.appendChild(optionElement);
        }

        filterYearElement.addEventListener("change", renderDataByFIilterYear);
      }

      const labelChart = Object.keys(dataSalesObject);
      const dataChart = Object.values(dataSalesObject);

      const isYearFilterExist = year || true;

      if (isYearFilterExist) {
        wrapperChart.removeChild(wrapperChart.lastElementChild);
        wrapperChart.removeChild(wrapperChart.lastElementChild);
        wrapperChart.removeChild(wrapperChart.lastElementChild);

        const ctxBarChart = document.createElement("canvas");
        ctxBarChart.id = "bar-chart";
        ctxBarChart.style.width = "30%";
        wrapperChart.appendChild(ctxBarChart);

        const ctxPieChart = document.createElement("canvas");
        ctxPieChart.id = "pie-chart";
        ctxBarChart.style.width = "30%";
        wrapperChart.appendChild(ctxPieChart);

        const ctxLineChart = document.createElement("canvas");
        ctxLineChart.id = "line-chart";
        ctxBarChart.style.width = "30%";
        wrapperChart.appendChild(ctxLineChart);

        renderBarChart(ctxBarChart.getContext("2d"), labelChart, dataChart);
        renderPieChart(ctxPieChart.getContext("2d"), labelChart, dataChart);
        renderLineChart(ctxLineChart.getContext("2d"), labelChart, dataChart);

        while (tableData.firstChild) {
          tableData.removeChild(tableData.lastChild);
        }
        renderTable(1, 10, year, sortDataTable, dataSlice);
      } else {
        const ctxBarChart = document
          .getElementById("bar-chart")
          .getContext("2d");

        renderBarChart(ctxBarChart, labelChart, dataChart);

        const ctxPieChart = document
          .getElementById("pie-chart")
          .getContext("2d");

        renderBarChart(ctxPieChart, labelChart, dataChart);

        const ctxLineChart = document
          .getElementById("line-chart")
          .getContext("2d");
        
          renderLineChart(ctxLineChart, labelChart, dataChart);
          renderTable(1, 10, year, sortDataTable, dataSlice);
      }

    })
    .catch((error) => {
      console.log({ error });
      // alert("Error: " + JSON.stringify(error));
    });
}

fetchDataJson(); // first render

function renderBarChart(ctx, labels, data) {
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales Price",
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "x",
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "# Sales Price by Borough",
        },
      },
    },
  });
}

function renderPieChart(ctx, labels, data) {
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales Price",
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "# Sales Price by Borough",
        },
      },
    },
  });
}

function renderLineChart(ctx, labels, data){
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales Price",
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "# Sales Price Line Chart",
        },
      },
    },
  });
}

function renderDataByFIilterYear(el) {
  return fetchDataJson(el.target.value, sortDataTable.value);
}

function renderDataBySortDataTable(el) {
  return fetchDataJson(filterYearElement.value, el.target.value);
}

function renderTable(page, limit, year, sort = "", data) {
  const filteredData = year
        ? data.filter((el) => el["SALE DATE"].split("-")[0] === year)
        : data;

  if (sort === "asc") {
    filteredData.sort((a, b) => a["SALE PRICE"] - b["SALE PRICE"]);
  }

  if (sort === "desc") {
    filteredData.sort((a, b) => b["SALE PRICE"] - a["SALE PRICE"]);
  }

  for(let i = 0; i < filteredData.length; i++){
    if (i >= (page - 1) * limit && i < limit * page) {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      const td3 = document.createElement("td");
      const td4 = document.createElement("td");
      const td5 = document.createElement("td");
      const td6 = document.createElement("td");

      td1.innerText = i + 1;
      td2.innerText = filteredData[i].BOROUGH;
      td3.innerText = filteredData[i].NEIGHBORHOOD;
      td4.innerText = filteredData[i]['TOTAL UNITS'];
      td5.innerText = IDR.format(filteredData[i]["SALE PRICE"]);
      td6.innerText = filteredData[i]["SALE DATE"];

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);

      tableData.appendChild(tr);
    }
  }
}