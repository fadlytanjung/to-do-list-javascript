const totalLot = document.getElementById("total-lot");
const totalSalesPrice = document.getElementById("total-sales-price");
const tableData = document.getElementById("data-table");
const yearBuiltOption = document.getElementById("year-built");

let page = 1;
let limit = 100;
let year;

let IDR = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

fetchDataJson(page, limit);
yearBuiltOption.addEventListener("change", (e) => {
  year = e.target.value;
  fetchDataJson(page, limit, year, false);
});

function fetchDataJson(page, size, year = "", render = true) {
  fetch("./data/data-tim-10.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const filteredData = data
        .slice((page - 1) * limit, limit * page)
        .filter((el) => {
          if (year) {
            return el.YEAR_BUILT === year;
          }
          return el;
        })
        .sort((a, b) => b.SALE_PRICE - a.SALE_PRICE);

      const getAllYearBuilt = filteredData.map((el) => el.YEAR_BUILT);
      const uniqueYearBuilt = [...new Set(getAllYearBuilt)];
      const convertYearBuiltToNumber = uniqueYearBuilt
        .map((el) => Number(el))
        .sort((a, b) => a - b);

      const optionYearBuilt = convertYearBuiltToNumber
        .map((el) => `<option value="${el}">${el}</option>`)
        .join("");

      if (render) {
        yearBuiltOption.innerHTML += optionYearBuilt;
      }

      const totalLotData = filteredData.reduce(
        (acc, curr) => acc + Number(curr.LOT),
        0
      );
      const totalSalesPriceData = filteredData.reduce(
        (acc, curr) => acc + Number(curr.SALE_PRICE),
        0
      );

      const formatTotalLot = totalLotData.toLocaleString();
      const formatTotalSales = IDR.format(totalSalesPriceData);

      totalLot.innerHTML = formatTotalLot;
      totalSalesPrice.innerHTML = formatTotalSales;
      let dataBody = "";
      for (let i = 0; i < filteredData.length; i++) {
        if (i >= (page - 1) * limit && i < limit * page) {
          data.push(filteredData[i]);
          dataBody += `
              <tr>
                <td>${i + 1}</td>
                <td>${filteredData[i].BOROUGH}</td>
                <td>${filteredData[i].ADDRESS}</td>
                <td>${filteredData[i].LOT}</td>
                <td>${filteredData[i].SALE_PRICE}</td>
                <td>${filteredData[i].YEAR_BUILT}</td>
              </tr>
              `;
        }
      }

      tableData.innerHTML = dataBody;

      // render chart-bar
      const mappingChartBarData = {}; // { 2005: 100, 2006: 300 }

      for (let i = 0; i < filteredData.length; i++) {
        if (!mappingChartBarData[filteredData[i].YEAR_BUILT]) {
          mappingChartBarData[filteredData[i].YEAR_BUILT] = Number(
            filteredData[i].LOT
          );
        } else {
          mappingChartBarData[filteredData[i].YEAR_BUILT] += Number(
            filteredData[i].LOT
          );
        }
      }

      const labelChartBar = Object.keys(mappingChartBarData);
      const dataChartBar = Object.values(mappingChartBarData);

      // render data to chart-bar
      const ctx = document.getElementById("chart-bar");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labelChartBar,
          datasets: [
            {
              label: "# LOT per Year",
              data: dataChartBar,
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
        },
      });
    })
    .catch((error) => {
      console.log({ error });
      // alert("Error: " + JSON.stringify(error));
    });
}
