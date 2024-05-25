const totalLot = document.getElementById("total-lot");
const totalSalesPrice = document.getElementById("total-sales-price");
const tableData = document.getElementById("data-table");
const filterYearElement = document.getElementById("year");
const wrapperChart = document.getElementById("wrapper-chart");

function fetchDataJson(year) {
  fetch("./data/data-tim-09.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const dataSlice = year ? data.filter((el) => el["SALE DATE"].split("-")[0] === year) : data;
      const dataSalesObject = {};

      for(let i = 0; i < dataSlice.length; i++){
        if (dataSalesObject[dataSlice[i].BOROUGH]) {
          dataSalesObject[dataSlice[i].BOROUGH] += dataSlice[i]["SALE PRICE"];
        } else {
          dataSalesObject[dataSlice[i].BOROUGH] = dataSlice[i]["SALE PRICE"];
        }
      }

      const yearData = dataSlice.map((el) => el["SALE DATE"].split("-")[0]);
      
      const yearDataMap = [...new Set(yearData)].sort();

      if (
        !year &&
        filterYearElement.options.length > 0 &&
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

        const ctxBarChart = document.createElement("canvas");
        ctxBarChart.id = "bar-chart";
        wrapperChart.appendChild(ctxBarChart);

        const ctxPieChart = document.createElement("canvas");
        ctxPieChart.id = "pie-chart";
        wrapperChart.appendChild(ctxPieChart);

        renderBarChart(ctxBarChart.getContext("2d"), labelChart, dataChart);
        renderPieChart(ctxPieChart.getContext("2d"), labelChart, dataChart);
    
      } else {
        const ctxBarChart = document
          .getElementById("bar-chart")
          .getContext("2d");
      
        renderBarChart(ctxBarChart, labelChart, dataChart);

        const ctxPieChart = document
          .getElementById("pie-chart")
          .getContext("2d");

        renderBarChart(ctxPieChart, labelChart, dataChart);
      }

    })
    .catch((error) => {
      console.log({ error });
      // alert("Error: " + JSON.stringify(error));
    });
}

fetchDataJson();

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

function renderPieChart(ctx, labels, data){
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales Price : ",
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

function renderDataByFIilterYear(el){
  return fetchDataJson(el.target.value);
}