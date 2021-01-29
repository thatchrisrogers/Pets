let todaysDate = new Date();
todaysDate.setHours(0, 0, 0, 0);
let months = [{ value: 1, text: 'January' }, { value: 2, text: 'February' }, { value: 3, text: 'March' }, { value: 4, text: 'April' }, { value: 5, text: 'May' }, { value: 6, text: 'June' }, { value: 7, text: 'July' }, { value: 8, text: 'August' }, { value: 9, text: 'September' }, { value: 10, text: 'October' }, { value: 11, text: 'November' }, { value: 12, text: 'December' }];
let selectMonth;
let selectYear;
let selectBusiness;
let businessUnavailableDates = [];

function setTheTime() {
    let theTime = new Date();
    let theTimeElement = document.getElementById("TheTime");
    if (theTimeElement) {
        theTimeElement.innerHTML = theTime.toDisplayTime();
    }
    setInterval(setTheTime, 60000);
}
function initCalendarControls() {
    let currentMonth = todaysDate.getMonth() + 1;
    let currentYear = todaysDate.getFullYear();
    selectMonth = document.getElementById('SelectMonth');
    selectYear = document.getElementById('SelectYear');

    let optionMonth;
    for (selectedMonth of months) {
        optionMonth = document.createElement('option');
        optionMonth.value = selectedMonth.value;
        optionMonth.text = selectedMonth.text;
        selectMonth.appendChild(optionMonth);
    }
    selectMonth.value = currentMonth;

    let optionYear;
    for (let i = -1; i <= 1; i++) {
        optionYear = document.createElement('option');
        optionYear.text = currentYear + i;
        optionYear.value = currentYear + i;
        selectYear.appendChild(optionYear);
        optionYear = document.createElement('option');
    }
    selectYear.value = currentYear;
}
function changeMonthYear(callBackFunction) {
    callBackFunction();
}
function changeMonth(gotoMonth, callBackFunction) {
    let selectedMonth = parseInt(selectMonth.value);
    let selectedYear = parseInt(selectYear.value);
    if (gotoMonth === 1) {
        gotoMonth = (selectedMonth === 12) ? 1 : selectedMonth + 1;
        gotoYear = (selectedMonth === 12) ? selectedYear + 1 : selectedYear;
    } else if (gotoMonth === -1) {
        gotoMonth = (selectedMonth === 1) ? 12 : selectedMonth - 1;
        gotoYear = (selectedMonth === 1) ? selectedYear - 1 : selectedYear;
    }
    selectMonth.value = gotoMonth;
    selectYear.value = gotoYear;
    callBackFunction();
}