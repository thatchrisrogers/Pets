let today = new Date();
let months = [{ value: 0, text: "January" }, { value: 1, text: "February" }, { value: 2, text: "March" }, { value: 3, text: "April" }, { value: 4, text: "May" }, { value: 5, text: "June" }, { value: 6, text: "July" }, { value: 7, text: "August" }, { value: 8, text: "September" }, { value: 9, text: "October" }, { value: 10, text: "November" }, { value: 11, text: "December" } ];
let selectMonth;
let selectYear;

function initAvailabilityView() {
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    selectMonth = document.getElementById("selectMonth");
    selectYear = document.getElementById("selectYear");

    let optionMonth;
    for (month of months) {
        optionMonth = document.createElement("option");
        optionMonth.value = month.value;
        optionMonth.text = month.text;
        selectMonth.appendChild(optionMonth);
    }
    selectMonth.value = currentMonth;

    let optionYear;
    for (let i = -1; i <= 1; i++) {
        optionYear = document.createElement("option");
        optionYear.text = currentYear + i;
        optionYear.value = currentYear + i;
        selectYear.appendChild(optionYear);
        optionYear = document.createElement("option");
    }
    selectYear.value = currentYear;

    showCalendar(currentMonth, currentYear);
}
function showCalendar(month, year) {
    let firstDayOfMonth = (new Date(year, month)).getDay();

    calendarBody = document.getElementById("calendarBody");
    calendarBody.innerHTML = "";   // clearing all previous cells

    // creating all cells
    let dayOfMonth = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDayOfMonth) {
                cell = document.createElement("td");
                //cellText = document.createTextNode("");
                //cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (dayOfMonth > daysInMonth(month, year)) {
                break;
            }
            else {
                cell = document.createElement("td");
                cellText = document.createTextNode(dayOfMonth);
                if (dayOfMonth === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("selected");
                } 
                cell.onclick = function () {
                    try {
                        displayCareRequest(dayOfMonth);
                    }
                    catch (e) {
                        displayError('Error displaying Care Request - ' + e.message);
                    }
                }
                cell.appendChild(cellText);
                row.appendChild(cell);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(row); // appending each row into calendar body.
    }
}
function changeMonthYear() {
    showCalendar(document.getElementById("selectMonth").value, document.getElementById("selectYear").value);
}
function changeMonth(gotoMonth) {
    let selectedMonth = parseInt(selectMonth.value);
    let selectedYear = parseInt(selectYear.value);
    if (gotoMonth === 1) {
        gotoMonth = (selectedMonth === 11) ? 0 : selectedMonth + 1;
        gotoYear = (selectedMonth === 11) ? selectedYear + 1 : selectedYear;
    } else if (gotoMonth === -1) {
        gotoMonth = (selectedMonth === 0) ? 11 : selectedMonth - 1;
        gotoYear = (selectedMonth === 0) ? selectedYear - 1 : selectedYear;
    }   
    selectMonth.value = gotoMonth;
    selectYear.value = gotoYear;
    changeMonthYear();
}
function daysInMonth(month, year) {
    return 32 - new Date(year, month, 32).getDate();
}
function displayCareRequest(dayOfMonth) {
    let careRequestForm = document.forms.namedItem("CareRequestForm");
    let selectHouseholdName = document.getElementById("HouseholdName");
    let selectedDate = new Date(selectYear.value, selectMonth.value, dayOfMonth);
    document.getElementById("StartDate").value = selectedDate;

    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/customer', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                customers = JSON.parse(this.responseText);
                let option;
                for (customer of customers) {
                    option = document.createElement("option");
                    option.value = customer.ID;
                    option.text = customer.HouseholdName;
                    selectHouseholdName.appendChild(option);
                }
            }
            else {
                displayError('Error getting Household Names', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Household Names - onerror event');
    };


    careRequestForm.style.display = 'block';
}
function closeCareRequestForm() {
    document.getElementById("CareRequestForm").style.display = 'none';
}
